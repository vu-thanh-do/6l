import {
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  HomeOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@ant-design/pro-layout";
import {
  BackTop,
  Breadcrumb,
  Button,
  Col,
  Drawer,
  Form,
  Checkbox,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
  message,
  notification,
  DatePicker,
} from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import axiosClient from "../../apis/axiosClient";
import productApi from "../../apis/productsApi";
import "./productList.css";
import moment, * as moments from "moment";
const { confirm } = Modal;
const { Option } = Select;
const { Title } = Typography;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";

const VoucherList = () => {
  const [product, setProduct] = useState([]);
  const [category, setCategoryList] = useState([]);
  const [author, setAuthorList] = useState([]);
  const [dataVouche, setDataVouche] = useState();

  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [image, setImage] = useState();

  const [newsList, setNewsList] = useState([]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [totalEvent, setTotalEvent] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [description, setDescription] = useState();
  const [total, setTotalList] = useState(false);
  const [id, setId] = useState();
  const [visible, setVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [bookUrl, setBookUrl] = useState([]);
  const [checkType, setCheckType] = useState(false);
  const history = useHistory();

  const showModal = () => {
    setOpenModalCreate(true);
  };

  const handleOkUser = async (values) => {
    setLoading(true);
    try {
      const categoryList = {
        name: values.name,
        value: values.value,
        type: values.type,
        require: values.require,
        startDate: values.startDate,
        endDate: values.endDate,
      };
      return axiosClient
        .post("/voucher/create", categoryList)
        .then((response) => {
          if (response === undefined) {
            notification["error"]({
              message: `Thông báo`,
              description: " thất bại",
            });
          } else {
            notification["success"]({
              message: `Thông báo`,
              description: " thành công",
            });
            setImages([]);
            setOpenModalCreate(false);
            handleProductList();
          }
        });
    } catch (error) {
      throw error;
    }
  };

  const handleImageUpload = async (info) => {
    const image = info.file;
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axiosClient
        .post("/uploadFile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const imageUrl = response.image_url;
          console.log(imageUrl);
          // Lưu trữ URL hình ảnh trong trạng thái của thành phần
          setImages((prevImages) => [...prevImages, imageUrl]);

          console.log(images);
          message.success(`${info.file.name} đã được tải lên thành công!`);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateProduct = async (values) => {
    setLoading(true);
    try {
      // Nếu image không tồn tại, chỉ gọi API put
      const categoryList = {
        name: values.name,
        value: values.value,
        type: values.type,
        require: values.require,
        startDate: values.startDate,
        endDate: values.endDate,
      };

      return axiosClient
        .put("/voucher/edit/" + id, categoryList)
        .then((response) => {
          if (response === undefined) {
            notification["error"]({
              message: `Thông báo`,
              description: "Chỉnh sửa thất bại",
            });
            setLoading(false);
          } else {
            notification["success"]({
              message: `Thông báo`,
              description: "Chỉnh sửa thành công",
            });
            setOpenModalUpdate(false);
            handleProductList();
            setLoading(false);
          }
        });
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = (type) => {
    if (type === "create") {
      setOpenModalCreate(false);
    } else {
      setOpenModalUpdate(false);
    }
    console.log("Clicked cancel button");
  };

  const handleProductList = async () => {
    try {
      await productApi.getListVoucher().then((res) => {
        console.log(res);
        setProduct(res.data.docs);
        setLoading(false);
      });
    } catch (error) {
      console.log("Failed to fetch product list:" + error);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await productApi.deleteVoucher(id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Xóa sản phẩm thất bại",
          });
          setLoading(false);
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Xóa sản phẩm thành công",
          });
          setCurrentPage(1);
          handleProductList();
          setLoading(false);
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleChangeImage = (event) => {
    setImage(event.target.files[0]);
  };

  const handleProductEdit = (id) => {
    setOpenModalUpdate(true);
    (async () => {
      try {
        const response = await productApi.getDetailVoucher(id);
        console.log(response);
        setDataVouche(response);
        setId(id);
        form2.setFieldsValue({
          name: response.name,
          value: response.value,
          type: response.type,
          require: response.require,
          startDate: moment(response.startDate),
          endDate: moment(response.endDate),
        });
        setLoading(false);
      } catch (error) {
        throw error;
      }
    })();
  };

  const handleFilter = async (name) => {
    try {
      const res = await productApi.searchProduct(name);
      setTotalList(res.totalDocs);
      setProduct(res.data.docs);
    } catch (error) {
      console.log("search to fetch category list:" + error);
    }
  };

  const handleChange = (content) => {
    console.log(content);
    setDescription(content);
  };

  const columns = [
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tên voucher ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Kiểu",
      dataIndex: "type",
      key: "type",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Điều kiện",
      dataIndex: "require",
      key: "require",
      render: (text) => (
        <a>đơn hàng lớn hơn: {Number(text)?.toLocaleString()} VND</a>
      ),
    },
    {
      title: "ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => <a>{text?.split("T")[0]}</a>,
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => <a>{text?.split("T")[0]}</a>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <a
          style={{
            color: text == "active" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div>
          <Row>
            <div className="groupButton">
              <Button
                size="small"
                icon={<EditOutlined />}
                style={{
                  width: 150,
                  borderRadius: 5,
                  height: 30,
                  marginTop: 5,
                  backgroundColor: "green",
                }}
                type="primary"
                onClick={() => handleProductEdit(record._id)}
              >
                {"Chỉnh sửa"}
              </Button>
              <div style={{ marginTop: 5 }}>
                <Popconfirm
                  title="Bạn có chắc chắn xóa sản phẩm này?"
                  onConfirm={() => handleDeleteCategory(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    className="btn-hover"
                    style={{
                      width: 150,
                      borderRadius: 5,
                      height: 30,
                      backgroundColor: "red",
                    }}
                    type="primary"
                  >
                    {"Xóa"}
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </Row>
        </div>
      ),
    },
  ];

  const handleOpen = () => {
    setVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const startDateNew = moment(values.startDate).format("MM-DD-YYYY");
      console.log(startDateNew, "values.startDate");
      const formattedValues = {
        ...values,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      };
      form.resetFields();
      handleOkUser(formattedValues);
      setVisible(false);
    });
  };

  useEffect(() => {
    (async () => {
      try {
        await productApi
          .getListVoucher({ page: 1, limit: 10000 })
          .then((res) => {
            console.log(res);
            setTotalList(res.totalDocs);
            setProduct(res.data.docs);
            setLoading(false);
          });
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
      }
    })();
  }, []);

  // Định nghĩa state để theo dõi trạng thái của checkbox
  const [showPromotion, setShowPromotion] = useState(false);

  // Xử lý sự kiện khi checkbox được thay đổi
  const handleShowPromotionChange = (e) => {
    setShowPromotion(e.target.checked);
  };

  return (
    <div>
      <Spin spinning={loading}>
        <div className="container">
          <div style={{ marginTop: 20 }}>
            <div id="my__event_container__list">
              <PageHeader subTitle="" style={{ fontSize: 14 }}>
                <Row>
                  <Col style={{ opacity: 0 }} span="18">
                    <Input
                      placeholder="Tìm kiếm"
                      allowClear
                      onChange={handleFilter}
                      style={{ width: 300 }}
                    />
                  </Col>
                  <Col span="6">
                    <Row justify="end">
                      <Space>
                        <Button
                          className="btn-hover"
                          onClick={handleOpen}
                          icon={<PlusOutlined />}
                          style={{ marginLeft: 10 }}
                          type="primary"
                        >
                          Tạo mới
                        </Button>
                      </Space>
                    </Row>
                  </Col>
                </Row>
              </PageHeader>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <Table columns={columns} dataSource={product} size="small" />
          </div>
        </div>

        <Drawer
          title="Tạo mới"
          visible={visible}
          onClose={() => setVisible(false)}
          width={1000}
          footer={
            <div
              style={{
                textAlign: "right",
              }}
            >
              <Button
                onClick={() => setVisible(false)}
                style={{ marginRight: 8 }}
                type="primary"
              >
                Hủy
              </Button>
              <Button onClick={handleSubmit} type="primary">
                Hoàn thành
              </Button>
            </div>
          }
        >
          <Form
            form={form}
            name="eventCreate"
            layout="vertical"
            initialValues={{
              residence: ["zhejiang", "hangzhou", "xihu"],
              prefix: "86",
            }}
            scrollToFirstError
          >
            <Spin spinning={loading}>
              <Form.Item
                name="name"
                label="Tên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên!",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Tên" />
              </Form.Item>
              {checkType != "freeShip" && (
                <Form.Item
                  name="value"
                  label="Giá trị"
                  style={{ marginBottom: 10 }}
                >
                  <Input placeholder="Giá trị voucher" />
                </Form.Item>
              )}
              <Form.Item
                name="require"
                label="Điều kiện sử dụng"
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Điều kiện sử dụng > VND" />
              </Form.Item>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                style={{ marginBottom: 10 }}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                style={{ marginBottom: 10 }}
              >
                <DatePicker />
              </Form.Item>

              <Form.Item
                name="type"
                label="Loại voucher"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn Loại voucher!",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  onChange={(value) => {
                    console.log(value);
                    setCheckType(value?.trim());
                  }}
                  style={{ width: "100%" }}
                  placeholder="Loại voucher"
                >
                  <Option value={"cash"}>cash</Option>
                  <Option value={"freeShip"}>freeShip</Option>
                </Select>
              </Form.Item>
            </Spin>
          </Form>
        </Drawer>

        <Drawer
          title="Chỉnh sửa "
          visible={openModalUpdate}
          onClose={() => handleCancel("update")}
          width={1000}
          footer={
            <div
              style={{
                textAlign: "right",
              }}
            >
              <Button
                onClick={() => {
                  form2
                    .validateFields()
                    .then((values) => {
                      console.log(values, "values"); // Kiểm tra dữ liệu đầu ra từ form
                      const formattedValues = {
                        ...values,
                        startDate: values.startDate
                          ? values.startDate.format("YYYY-MM-DD")
                          : null,
                        endDate: values.endDate
                          ? values.endDate.format("YYYY-MM-DD")
                          : null,
                      };
                      console.log(formattedValues, "formattedValues"); // Kiểm tra dữ liệu sau định dạng
                      form2.resetFields();
                      handleUpdateProduct(formattedValues);
                    })
                    .catch((info) => {
                      console.log("Validate Failed:", info);
                    });
                }}
                type="primary"
                style={{ marginRight: 8 }}
              >
                Hoàn thành
              </Button>
              <Button onClick={() => handleCancel("update")}>Hủy</Button>
            </div>
          }
        >
          <Form
            form={form2}
            name="eventCreate"
            layout="vertical"
            initialValues={{
              residence: ["zhejiang", "hangzhou", "xihu"],
              prefix: "86",
            }}
            scrollToFirstError
          >
            <Form.Item
              name="name"
              label="Tên"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Tên" />
            </Form.Item>

            {dataVouche?.type != "freeShip" && (
              <>
                <Form.Item
                  name="value"
                  label="Giá trị Voucher"
                  style={{ marginBottom: 10 }}
                >
                  <Input placeholder="Giá trị Voucher" />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="require"
              label="Điều kiện sử dụng"
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Điều kiện sử dụng > VND" />
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
              ]}
              style={{ marginBottom: 10 }}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
              ]}
              style={{ marginBottom: 10 }}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="type"
              label="Loại voucher"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn Loại voucher!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Select style={{ width: "100%" }} placeholder="Loại voucher">
                <Option value={"cash"}>cash</Option>
                <Option value={"freeShip"}>freeShip</Option>
              </Select>
            </Form.Item>
          </Form>
        </Drawer>

        <BackTop style={{ textAlign: "right" }} />
      </Spin>
    </div>
  );
};

export default VoucherList;
