import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  Card,
  Button,
  message,
  List,
  Tag,
  Modal,
  Radio,
  Form,
  Select,
  Input,
  Divider,
  Steps,
  Row,
  Col,
  Typography,
  Space
} from "antd";
import moment from "moment";
import axios from "axios";
import axiosClient from "../../../apis/axiosClient";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BorrowConfirm = () => {
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { selectedBooks, totalBooks } = location.state;
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const local = JSON.parse(localStorage.getItem("user") || "{}");
  const id = local._id;
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [depositFee, setDepositFee] = useState(0);

  // Lấy danh sách tỉnh thành
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh thành:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Tính tổng phí mượn
  const calculateTotalBorrowFee = () => {
    return selectedBooks.reduce((total, book) => total + (book.borrowFee || 0), 0);
  };

  // Tính tiền đặt cọc khi component mount
  useEffect(() => {
    const calculateDeposit = () => {
      const deposit = selectedBooks.reduce((total, book) => total + book.price, 0);
      const borrowFee = calculateTotalBorrowFee();
      setDepositFee(deposit);
      setTotalAmount(deposit + borrowFee); // Tổng = Tiền đặt cọc + Phí mượn
    };
    calculateDeposit();
  }, [selectedBooks]);

  // Xử lý khi chọn tỉnh/thành
  const handleProvinceChange = async (value) => {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${value}?depth=2`);
      setDistricts(response.data.districts);
      form.setFieldsValue({ district: undefined, ward: undefined });
      setWards([]);
      calculateShippingFee(value);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
    }
  };

  // Xử lý khi chọn quận/huyện
  const handleDistrictChange = async (value) => {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${value}?depth=2`);
      setWards(response.data.wards);
      form.setFieldsValue({ ward: undefined });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phường/xã:", error);
    }
  };

  // Tính phí ship dựa trên tỉnh thành
  const calculateShippingFee = (provinceId) => {
    // Tìm thông tin tỉnh/thành phố
    const selectedProvince = provinces.find(p => p.code === provinceId);
    
    if (!selectedProvince) return;

    let shippingFee = 0;
    
    // Phí vận chuyển theo khu vực
    switch (selectedProvince.name) {
      case "Thành phố Hà Nội":
      case "Thành phố Hồ Chí Minh":
      case "Thành phố Đà Nẵng":
        shippingFee = 20000; // Phí ship nội thành
        break;
      case "Bình Dương":
      case "Đồng Nai":
      case "Hưng Yên":
      case "Bắc Ninh":
      case "Hải Phòng":
        shippingFee = 30000; // Phí ship vùng lân cận
        break;
      default:
        shippingFee = 40000; // Phí ship các tỉnh khác
    }

    // Tính thêm phí theo số lượng sách
    const bookQuantity = selectedBooks.length;
    if (bookQuantity > 1) {
      shippingFee += (bookQuantity - 1) * 5000; // Mỗi cuốn thêm tính phí 5,000đ
    }

    setShippingFee(shippingFee);
    
    // Cập nhật tổng tiền khi thay đổi phí ship
    const totalBorrowFee = calculateTotalBorrowFee();
    setTotalAmount(depositFee + totalBorrowFee + shippingFee);
  };

  // Cập nhật tổng tiền khi thay đổi phương thức nhận sách
  const handleDeliveryMethodChange = (e) => {
    const method = e.target.value;
    setDeliveryMethod(method);
    
    // Nếu nhận tại thư viện, không tính phí ship
    if (method === "pickup") {
      setShippingFee(0);
      setTotalAmount(depositFee);
    } else {
      // Nếu đã chọn tỉnh thành thì tính lại phí ship
      const provinceValue = form.getFieldValue("province");
      if (provinceValue) {
        calculateShippingFee(provinceValue);
      }
    }
  };

  // Xử lý khi xác nhận mượn sách
  const handleConfirmBorrow = async (values) => {
    try {
      setLoading(true);

      const borrowData = {
        books: selectedBooks,
        deliveryMethod,
        ...values
      };

      if (deliveryMethod === "shipping") {
        borrowData.shippingAddress = {
          province: provinces.find(p => p.code === values.province)?.name,
          district: districts.find(d => d.code === values.district)?.name,
          ward: wards.find(w => w.code === values.ward)?.name,
          address: values.address,
          note: values.note
        };
        borrowData.shippingFee = shippingFee;
      }

      // Gọi API để tạo phiếu mượn
      await axiosClient.post(`http://localhost:3100/api/book-loan/borrow/${id}`, borrowData);

      // Xóa giỏ mượn sau khi đã xác nhận
      localStorage.removeItem("borrowItems");

      Modal.success({
        title: "Đăng ký mượn sách thành công",
        content: "Vui lòng chờ thủ thư duyệt yêu cầu mượn sách của bạn",
        onOk: () => history.push("/my-loans")
      });

    } catch (error) {
      message.error("Có lỗi xảy ra khi đăng ký mượn sách: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", minWidth: "100%", margin: "0 auto" }}>
      <Steps
        current={1}
        items={[
          { title: "Chọn sách" },
          { title: "Xác nhận thông tin" },
          { title: "Hoàn tất" }
        ]}
        style={{ marginBottom: 40 }}
      />

      <Row gutter={32}>
        <Col span={15}>
          <Card 
            title={<Title level={4}>Danh sách sách mượn</Title>}
            style={{ marginBottom: 24 }}
          >
            <List
              itemLayout="horizontal"
              dataSource={selectedBooks}
              renderItem={book => (
                <List.Item style={{ padding: "24px 0" }}>
                  <List.Item.Meta
                    avatar={
                      <img
                        src={book.image}
                        alt={book.name}
                        style={{ width: 100, height: 150, objectFit: "cover", borderRadius: 8 }}
                      />
                    }
                    title={<Text strong style={{ fontSize: 18 }}>{book.name}</Text>}
                    description={
                      <Space direction="vertical" size={12} style={{ marginTop: 8 }}>
                        <p><Text type="secondary">Tác giả:</Text> <Text>{book.author}</Text></p>
                        <p><Text type="secondary">Thể loại:</Text> <Text>{book.category}</Text></p>
                        <p><Text type="secondary">Giá sách:</Text> <Text>{book.price?.toLocaleString()}đ</Text></p>
                        <p><Text type="secondary">Số ngày mượn:</Text> <Text>{book.borrowDays} ngày</Text></p>
                        <p><Text type="secondary">Phí mượn:</Text> <Text>{book.borrowFee?.toLocaleString()}đ</Text></p>
                        <p>
                          <Text type="secondary">Ngày trả dự kiến:</Text>{" "}
                          <Tag color="blue" style={{ padding: "4px 12px", fontSize: 14 }}>
                            {moment(book.dueDate).format("DD/MM/YYYY")}
                          </Tag>
                        </p>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider />

            <div style={{ padding: "0 24px" }}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div>
                  <Text style={{ fontSize: 16 }}>Tổng tiền đặt cọc: </Text>
                  <Text strong style={{ fontSize: 16, float: "right" }}>
                    {depositFee.toLocaleString()}đ
                  </Text>
                </div>
                <div>
                  <Text style={{ fontSize: 16 }}>Tổng phí mượn ({selectedBooks.reduce((total, book) => total + book.borrowDays, 0)} ngày): </Text>
                  <Text strong style={{ fontSize: 16, float: "right" }}>
                    {calculateTotalBorrowFee().toLocaleString()}đ
                  </Text>
                </div>
                {deliveryMethod === "shipping" && (
                  <div>
                    <Text style={{ fontSize: 16 }}>Phí vận chuyển: </Text>
                    <Text strong style={{ fontSize: 16, color: "#1890ff", float: "right" }}>
                      {shippingFee.toLocaleString()}đ
                    </Text>
                  </div>
                )}
                <Divider style={{ margin: "12px 0" }} />
                <div>
                  <Text strong style={{ fontSize: 18 }}>Tổng tiền cần thanh toán: </Text>
                  <Text strong style={{ fontSize: 18, color: "#f5222d", float: "right" }}>
                    {(totalAmount + (deliveryMethod === "shipping" ? shippingFee : 0)).toLocaleString()}đ
                  </Text>
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        <Col span={9}>
          <Card 
            title={<Title level={4}>Thông tin mượn sách</Title>}
            style={{ position: "sticky", top: 24 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleConfirmBorrow}
              size="large"
            >
              <Form.Item
                name="deliveryMethod"
                label={<Text strong>Phương thức nhận sách</Text>}
                initialValue={deliveryMethod}
              >
                <Radio.Group
                  onChange={handleDeliveryMethodChange}
                  value={deliveryMethod}
                  size="large"
                  style={{ width: "100%" }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Radio.Button value="pickup" style={{ width: "100%", height: 45, lineHeight: "43px", textAlign: "center" }}>
                      Nhận tại thư viện
                    </Radio.Button>
                    <Radio.Button value="shipping" style={{ width: "100%", height: 45, lineHeight: "43px", textAlign: "center" }}>
                      Giao tận nơi
                    </Radio.Button>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {deliveryMethod === "shipping" && (
                <>
                  <Form.Item
                    name="province"
                    label={<Text strong>Tỉnh/Thành phố</Text>}
                    rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
                  >
                    <Select
                      placeholder="Chọn tỉnh/thành phố"
                      onChange={handleProvinceChange}
                      size="large"
                    >
                      {provinces.map(province => (
                        <Option key={province.code} value={province.code}>
                          {province.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="district"
                    label={<Text strong>Quận/Huyện</Text>}
                    rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
                  >
                    <Select
                      placeholder="Chọn quận/huyện"
                      onChange={handleDistrictChange}
                      size="large"
                    >
                      {districts.map(district => (
                        <Option key={district.code} value={district.code}>
                          {district.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="ward"
                    label={<Text strong>Phường/Xã</Text>}
                    rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
                  >
                    <Select 
                      placeholder="Chọn phường/xã"
                      size="large"
                    >
                      {wards.map(ward => (
                        <Option key={ward.code} value={ward.code}>
                          {ward.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="address"
                    label={<Text strong>Địa chỉ cụ thể</Text>}
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
                  >
                    <Input 
                      placeholder="Số nhà, tên đường..."
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item 
                    name="note" 
                    label={<Text strong>Ghi chú</Text>}
                  >
                    <TextArea
                      placeholder="Ghi chú thêm về địa chỉ giao sách..."
                      rows={3}
                      size="large"
                    />
                  </Form.Item>

                  <Divider />

                  <div style={{ marginBottom: 24 }}>
                    <Title level={5}>Thông tin mượn:</Title>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <p style={{ fontSize: 16 }}>
                        Số lượng sách: <Text strong>{totalBooks} cuốn</Text>
                      </p>
                      <div>
                        <Text type="secondary" strong style={{ fontSize: 16 }}>Lưu ý:</Text>
                        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                          <li>Phí mượn: 3.000đ/ngày/cuốn</li>
                          <li>Tiền đặt cọc sẽ được hoàn trả khi trả sách đúng hạn và không hư hỏng</li>
                          <li>Thời gian mượn tối đa là 30 ngày</li>
                          <li>Vui lòng trả sách đúng hạn</li>
                        </ul>
                      </div>
                    </Space>
                  </div>
                </>
              )}

              <Divider />

              <div style={{ textAlign: "right" }}>
                <Space size={16}>
                  <Button
                    size="large"
                    onClick={() => history.goBack()}
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                  >
                    Xác nhận mượn sách
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BorrowConfirm; 