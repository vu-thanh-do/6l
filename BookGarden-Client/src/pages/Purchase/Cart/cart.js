import { CreditCardOutlined, LeftSquareOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  InputNumber,
  Layout,
  Row,
  Spin,
  Statistic,
  Table,
  Modal,
  message,
  Checkbox,
} from "antd";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import "./cart.css";
import productApi from "../../../apis/productApi";
const { Content } = Layout;

const Cart = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLength, setCartLength] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const history = useHistory();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const handlePay = () => {
    if (selectedProducts.length === 0) {
      message.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    // Lọc các sản phẩm đã chọn từ giỏ hàng
    const selectedCartItems = productDetail.filter((item) =>
      selectedProducts.includes(item._id)
    );

    // Chuyển hướng đến trang thanh toán với danh sách sản phẩm đã chọn
    history.push({
      pathname: "/pay",
      state: { selectedProducts: selectedCartItems }, // Gửi danh sách sản phẩm đã chọn
    });
  };

  const deleteCart = () => {
    localStorage.removeItem("cart");
    setProductDetail([]);
    setCartTotal(0);
    setCartLength(0);
  };

  const updateStock = (productId, newStock) => {
    productApi
      .getDetailProduct(productId)
      .then((response) => {
        const availableStock = response?.product?.stock;

        if (availableStock === undefined) {
          console.error("Không có trường stock trong dữ liệu API.");
          return;
        }

        // Kiểm tra giới hạn tồn kho
        if (newStock > availableStock) {
          message.error(
            `Số lượng bạn nhập (${newStock}) lớn hơn số lượng tồn kho (${availableStock}). Vui lòng nhập lại.`
          );
          return;
        }

        // Cập nhật giỏ hàng nếu hợp lệ
        const updatedCart = productDetail.map((item) => {
          if (item._id === productId) {
            item.stock = newStock; // Cập nhật số lượng cho sản phẩm đã chọn
            item.total = item.salePrice * newStock; // Cập nhật tổng cho sản phẩm
          }
          return item;
        });

        // Tính lại tổng giá trị giỏ hàng chỉ cho các sản phẩm đã chọn
        const total = updatedCart.reduce(
          (acc, item) =>
            acc + (selectedProducts.includes(item._id) ? item.total : 0),
          0
        );

        setCartTotal(total);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setProductDetail(updatedCart);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
      });
  };
  const handleDelete = (productId) => {
    // Lọc lại giỏ hàng
    const updatedCart = productDetail.filter(
      (product) => product._id !== productId
    );

    // Lưu giỏ hàng đã cập nhật vào localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Cập nhật các trạng thái
    setProductDetail(updatedCart); // Cập nhật danh sách sản phẩm
    setCartLength(updatedCart.length); // Cập nhật số lượng sản phẩm trong giỏ hàng

    // Tính lại tổng giá trị giỏ hàng
    const total = updatedCart.reduce(
      (acc, item) => acc + item.stock * item.salePrice,
      0
    );
    setCartTotal(total);

    // Hiển thị thông báo thành công
    message.success("Sản phẩm đã được xóa khỏi giỏ hàng!");

    // Tự động reload trang sau khi xóa sản phẩm
    window.location.reload();
  };

  const handleDeleteConfirm = (productId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      content: "Sản phẩm này sẽ bị xóa khỏi giỏ hàng.",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => handleDelete(productId),
    });
  };

  const handleDeleteAllConfirm = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?",
      content: "Tất cả sản phẩm sẽ bị xóa khỏi giỏ hàng.",
      okText: "Xóa tất cả",
      cancelText: "Hủy",
      onOk: deleteCart,
    });
  };
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId];

      // Lưu trạng thái vào localStorage
      localStorage.setItem("selectedProducts", JSON.stringify(newSelected));

      // Tính lại tổng tiền khi chọn hoặc bỏ chọn sản phẩm
      const total = productDetail.reduce(
        (acc, item) =>
          acc +
          (newSelected.includes(item._id)
            ? (item.salePrice || 0) * (item.stock || 1) // Đặt giá trị mặc định
            : 0),
        0
      );
      setCartTotal(total);

      setCartTotal(total);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === productDetail.length) {
      // Nếu tất cả sản phẩm đã được chọn, bỏ chọn tất cả
      setSelectedProducts([]);
      setCartTotal(0); // Đặt tổng tiền về 0 khi bỏ chọn
      localStorage.removeItem("selectedProducts"); // Xóa khỏi localStorage
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả
      const allProductIds = productDetail.map((item) => item._id);
      setSelectedProducts(allProductIds);

      // Tính tổng tiền cho tất cả sản phẩm
      const total = productDetail.reduce((acc, item) => acc + item.total, 0);
      setCartTotal(total);

      // Lưu trạng thái vào localStorage
      localStorage.setItem("selectedProducts", JSON.stringify(allProductIds));
    }
  };
  const columns = [
    {
      title: "Chọn",
      key: "select",
      render: (text, record) => (
        <Checkbox
          checked={selectedProducts.includes(record._id)}
          onChange={() => handleSelectProduct(record._id)}
        />
      ),
    },
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => <img src={image} style={{ height: 80 }} />,
      width: "10%",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a onClick={() => handleRowClick(record)}>{text}</a>
      ),
    },
    {
      title: "Giá",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (text) => (
        <a>
          {text?.toLocaleString("vi", { style: "currency", currency: "VND" })}
        </a>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "stock",
      key: "stock",
      render: (text, record) => (
        <InputNumber
          min={1}
          max={record?.availableStock}
          defaultValue={text}
          onChange={(value) => updateStock(record._id, value)}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text, record) => (
        <div>
          <div className="groupButton">
            {(record?.salePrice * record?.stock).toLocaleString("vi", {
              style: "currency",
              currency: "VND",
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <Button type="danger" onClick={() => handleDeleteConfirm(record._id)}>
          Xóa
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = cart.map((item) => ({
      ...item,
      stock: item.stock || 1, // Đặt giá trị mặc định là 1 nếu thiếu
      salePrice: item.salePrice || 0, // Đặt giá trị mặc định là 0 nếu thiếu
      total: (item.salePrice || 0) * (item.stock || 1), // Tính total với giá trị mặc định
    }));

    setProductDetail(updatedCart);
    setCartLength(updatedCart.length);

    // Tải trạng thái selectedProducts từ localStorage
    const savedSelectedProducts =
      JSON.parse(localStorage.getItem("selectedProducts")) || [];
    setSelectedProducts(savedSelectedProducts);

    const total = updatedCart.reduce(
      (acc, item) =>
        acc + (savedSelectedProducts.includes(item._id) ? item.total : 0),
      0
    );

    setCartTotal(total);
    setLoading(false);
  }, []);

  const handleRowClick = (record) => {
    history.push("/product-detail/" + record._id);
  };

  const handleToHomeProduct = () => {
    history.push("/product-list");
  };

  return (
    <div>
      <div className="py-5">
        <Spin spinning={loading}>
          <Card className="container">
            <div className="box_cart">
              <Layout className="box_cart">
                <Content className="site-layout-background">
                  <Breadcrumb>
                    <Breadcrumb.Item onClick={handleToHomeProduct}>
                      <LeftSquareOutlined style={{ fontSize: "24px" }} />
                      <span> Tiếp tục mua sắm</span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                  <hr />
                  <br />
                  {cartLength === 0 ? (
                    <div className="text-center">
                      <img
                        src="https://maydongphucyte.com/default/template/img/cart-empty.png"
                        className="mx-auto"
                        alt="Giỏ hàng trống"
                      />
                      <h4 className="text-gray-500">
                        Chưa có sản phẩm trong giỏ hàng của bạn.
                      </h4>
                      <button
                        onClick={handleToHomeProduct}
                        className="mt-4 bg-red-500 hover:bg-red-700 text-white py-3 px-8 text-lg font-semibold rounded-lg shadow-md transition-all duration-200"
                      >
                        Mua sắm ngay
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Row>
                        <Col span={12}>
                          <h4>
                            <strong>{cartLength}</strong> Sản Phẩm
                          </h4>
                        </Col>
                        <Col span={12}>
                          <Button
                            type="default"
                            danger
                            style={{ float: "right" }}
                            onClick={handleDeleteAllConfirm}
                          >
                            <span>Xóa tất cả</span>
                          </Button>
                          <Button
                            type="default"
                            style={{ float: "right", marginRight: "10px" }}
                            onClick={handleSelectAll} // Gọi hàm chọn tất cả
                          >
                            {selectedProducts.length === productDetail.length
                              ? "Bỏ chọn tất cả"
                              : "Chọn tất cả"}
                          </Button>
                        </Col>
                      </Row>
                      <br />
                      <Table
                        columns={columns}
                        dataSource={productDetail}
                        pagination={false}
                      />
                      <Divider orientation="right">
                        <p>Thanh toán</p>
                      </Divider>
                      <Row justify="end">
                        <Col>
                          <h6>Tổng {cartLength} sản phẩm</h6>
                          <Statistic
                            title="Tổng tiền (đã bao gồm VAT)."
                            value={cartTotal || 0} // Giá trị mặc định là 0 nếu cartTotal không hợp lệ
                            precision={0}
                            formatter={(value) =>
                              `${value.toLocaleString("vi", {
                                style: "currency",
                                currency: "VND",
                              })}`
                            }
                          />

                          <Button
                            style={{ marginTop: 16 }}
                            type="primary"
                            onClick={handlePay}
                            disabled={selectedProducts.length === 0}
                          >
                            Thanh toán ngay
                            <CreditCardOutlined style={{ fontSize: "20px" }} />
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  )}
                </Content>
              </Layout>
            </div>
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default Cart;
