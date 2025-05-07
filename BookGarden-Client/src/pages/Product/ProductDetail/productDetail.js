import {
  Breadcrumb,
  Card,
  Col,
  Form,
  Input,
  Rate,
  Row,
  Spin,
  message,
  Button,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ShoppingCartOutlined,
  BookOutlined,
} from "@ant-design/icons";
import Paragraph from "antd/lib/typography/Paragraph";
import React, { useEffect, useState, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import productApi from "../../../apis/productApi";
import triangleTopRight from "../../../assets/icon/Triangle-Top-Right.svg";
import { numberWithCommas } from "../../../utils/common";
import "react-h5-audio-player/lib/styles.css";
import "./productDetail.css";

const ProductDetail = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [recommend, setRecommend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLength, setCartLength] = useState();
  const [form] = Form.useForm();
  let { id } = useParams();
  const history = useHistory();
  const [visible2, setVisible2] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const addCart = (product) => {
    if (product.stock === 0) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }

    const existingItems = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = existingItems.findIndex(
      (item) => item._id === product._id
    );

    let updatedItems;
    let isMaxStock = false;

    if (existingItemIndex !== -1) {
      updatedItems = existingItems.map((item, index) => {
        if (index === existingItemIndex) {
          if (item.stock >= product.stock) {
            message.warning("Không thể thêm quá số lượng tồn kho");
            isMaxStock = true;
            return item;
          }
          return { ...item, stock: item.stock + 1 };
        }
        return item;
      });
    } else {
      updatedItems = [...existingItems, { ...product, stock: 1 }];
    }

    if (isMaxStock) return; // Nếu đã đạt tối đa, thoát khỏi hàm

    setCartLength(updatedItems.length);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
    localStorage.setItem("cartLength", updatedItems.length);

    // Hiển thị thông báo thành công
    message.success("Thêm sản phẩm vào giỏ hàng thành công!");

    // Trì hoãn reload trang để thông báo hiển thị trước
    setTimeout(() => {
      window.location.reload();
    }, 500); // Trì hoãn reload trong 1 giây
  };

  const paymentCard = (product) => {
    if (product.stock === 0) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }

    const existingItems = JSON.parse(localStorage.getItem("cart")) || [];
    let updatedItems;
    const existingItemIndex = existingItems.findIndex(
      (item) => item._id === product._id
    );

    if (existingItemIndex !== -1) {
      // Nếu sản phẩm đã có trong giỏ hàng
      if (existingItems[existingItemIndex].stock >= product.stock) {
        message.warning("Không thể thêm quá số lượng tồn kho");
        return;
      }
      updatedItems = existingItems.map((item, index) => {
        if (index === existingItemIndex) {
          return { ...item, stock: item.stock + 1 };
        }
        return item;
      });
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng
      updatedItems = [...existingItems, { ...product, stock: 1 }];
    }

    // Lưu vào localStorage
    localStorage.setItem("cart", JSON.stringify(updatedItems));
    localStorage.setItem("cartLength", updatedItems.length);

    // Hiển thị thông báo

    // Điều hướng đến trang giỏ hàng
    setTimeout(() => {
      history.push("/cart");
    }, 300); // Trì hoãn 300ms để hiển thị thông báo trước khi chuyển trang
  };

  const handleReadMore = (id) => {
    console.log(id);
    history.push("/product-detail/" + id);
    window.location.reload();
  };

  const handleOpenModal = () => {
    setVisible2(true);
  };

  const handleCloseModal = () => {
    setVisible2(false);
  };

  const handleRateChange = (value) => {
    setRating(value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleReviewSubmit = async () => {
    // Tạo payload để gửi đến API
    const payload = {
      comment,
      rating,
    };

    // Gọi API đánh giá và bình luận
    await axiosClient
      .post(`/product/${id}/reviews`, payload)
      .then((response) => {
        console.log(response);
        // Xử lý khi gọi API thành công
        console.log("Review created");
        // Đóng modal và thực hiện các hành động khác nếu cần
        message.success("Thông báo:" + response);
        handleList();
        handleCloseModal();
      })
      .catch((error) => {
        // Xử lý khi gọi API thất bại
        console.error("Error creating review:", error);
        // Hiển thị thông báo lỗi cho người dùng nếu cần
        message.error("Đánh giá thất bại: " + error);
      });
  };

  const [reviews, setProductReview] = useState([]);
  const [reviewsCount, setProductReviewCount] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [user, setUser] = useState(null);

  const handleList = () => {
    (async () => {
      try {
        const local = localStorage.getItem("user");
        const user = JSON.parse(local);
        setUser(user);

        const productResponse = await productApi.getDetailProduct(id);
        console.log("Product Response:", productResponse);

        if (productResponse && productResponse.product) {
          setProductDetail(productResponse.product);
        } else {
          console.error("Product data is not available in the response.");
        }

        const recommendResponse = await productApi.getRecommendProduct(id);
        console.log("Recommendations Response:", recommendResponse);
        setRecommend(recommendResponse?.recommendations);

        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:", error);
      }
    })();
  };

  useEffect(() => {
    handleList();
    window.scrollTo(0, 0);
  }, [cartLength]);

  const handleImageClick = (image) => {
    setCurrentImage(image);
    setIsOpen(true); // Mở modal khi ảnh được nhấp vào
  };

  const handleBorrowBook = () => {
    // Kiểm tra đăng nhập
   

    // Lấy danh sách sách đã chọn từ localStorage
    const borrowItems = JSON.parse(localStorage.getItem("borrowItems") || "[]");

    // Kiểm tra số lượng sách đã mượn
    if (borrowItems.length >= 3) {
      message.error("Bạn chỉ được mượn tối đa 3 cuốn sách");
      return;
    }

    // Kiểm tra sách đã có trong giỏ mượn chưa
    const isExist = borrowItems.some((item) => item.id === productDetail._id);
    if (isExist) {
      message.warning("Sách này đã có trong giỏ mượn");
      return;
    }

    // Thêm sách vào giỏ mượn
    const newBorrowItem = {
      id: productDetail._id,
      name: productDetail.name,
      author: productDetail.author?.name,
      category: productDetail.category?.name,
      image: productDetail.image,
      price: productDetail.salePrice,
    };

    localStorage.setItem(
      "borrowItems",
      JSON.stringify([...borrowItems, newBorrowItem])
    );
    message.success("Đã thêm sách vào giỏ mượn");
  };

  return (
    <div>
      <Spin spinning={false}>
        <Card className="container_details">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/home">
                  {/* <HomeOutlined /> */}
                  <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="http://localhost:3500/product-list">
                  {/* <AuditOutlined /> */}
                  <span>Sản phẩm</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>{productDetail.name}</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <Row gutter={12} style={{ marginTop: 20 }}>
              <Col span={8}>
                <Card className="card_image" bordered={false}>
                  <img src={productDetail.image} />
                  {productDetail?.slide?.length > 0 && (
                    <div
                      className="slide-images"
                      style={{
                        marginTop: 20,
                        marginRight: 120,
                        display: "flex",
                      }}
                    >
                      {productDetail.slide.map((item) => (
                        <div
                          className="img"
                          key={item}
                          style={{
                            margin: "5px",
                          }}
                        >
                          <img
                            style={{
                              width: "100px", // Bạn có thể điều chỉnh chiều rộng theo nhu cầu
                              height: "auto", // Giữ tỷ lệ khung hình
                            }}
                            src={item}
                            alt="Slide"
                            onClick={() => handleImageClick(item)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {currentImage && (
                    <div
                      style={{
                        position: "fixed", // Đảm bảo ảnh phóng to phủ lên trên màn hình
                        top: "0",
                        left: "0",
                        width: "100vw", // Chiếm toàn bộ chiều rộng màn hình
                        height: "100vh", // Chiếm toàn bộ chiều cao màn hình
                        backgroundColor: "rgba(0, 0, 0, 0.8)", // Nền mờ
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center", // Căn giữa ảnh
                        zIndex: 9999, // Đảm bảo ảnh nằm trên các phần tử khác
                        cursor: "pointer", // Thêm con trỏ để người dùng biết có thể đóng ảnh
                      }}
                      onClick={() => setCurrentImage("")} // Đóng ảnh khi click vào ảnh
                    >
                      <img
                        src={currentImage}
                        alt="Enlarged view"
                        style={{
                          maxWidth: "90%", // Giới hạn chiều rộng ảnh (90% của màn hình)
                          maxHeight: "90%", // Giới hạn chiều cao ảnh (90% của màn hình)
                          objectFit: "contain", // Giữ tỷ lệ ảnh mà không bị méo
                        }}
                      />
                    </div>
                  )}
                </Card>
              </Col>
              <Col className="card_detail">
                <div className="price">
                  <h1 className="product_name">{productDetail.name}</h1>
                  <Rate disabled value={avgRating} className="rate" />
                </div>
                <Card
                  className="card_total"
                  bordered={false}
                  style={{ width: "50%" }}
                >
                  {productDetail?.salePrice === productDetail?.price ? (
                    <div className="price_product">
                      {productDetail?.salePrice?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                  ) : (
                    <div>
                      <div className="price_product">
                        {productDetail?.salePrice?.toLocaleString("vi", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </div>
                      <div className="saleprice_product">
                        {productDetail?.price?.toLocaleString("vi", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 10 }}>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      Tác giả:
                      <span style={{ fontWeight: "normal", marginLeft: 5 }}>
                        {productDetail.author
                          ? productDetail.author.name
                          : "Không có thông tin tác giả"}
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      Nhà xuất bản:
                      <span style={{ fontWeight: "normal", marginLeft: 5 }}>
                        {productDetail.pulisher
                          ? productDetail.pulisher.name
                          : "Không có thông tin NXB"}
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      Năm xuất bản:
                      <span style={{ fontWeight: "normal", marginLeft: 5 }}>
                        {productDetail.year}
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      Số lượng:
                      <span style={{ fontWeight: "normal", marginLeft: 5 }}>
                        {productDetail.stock}
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      Số trang:
                      <span style={{ fontWeight: "normal", marginLeft: 5 }}>
                        {productDetail.pages}
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      Trọng lượng (gr):
                      <span style={{ fontWeight: "normal ", marginLeft: 5 }}>
                        {productDetail.weight}
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      Kích thước:
                      <span style={{ fontWeight: "normal", marginLeft: 5 }}>
                        {productDetail.size}
                      </span>
                    </span>

                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      Hình thức:
                      <span style={{ fontWeight: "normal", marginLeft: 5 }}>
                        {productDetail.form}
                      </span>
                    </span>

                    {productDetail?.status === "Unavailable" ||
                    productDetail?.status === "Discontinued" ? (
                      <Paragraph className="badge" style={{ marginTop: 10 }}>
                        {productDetail?.status === "Unavailable" ? (
                          <span>Hết hàng</span>
                        ) : (
                          <span>Ngừng kinh doanh</span>
                        )}
                        <img src={triangleTopRight} alt="Triangle" />
                      </Paragraph>
                    ) : null}
                  </div>

                  <div className="flex gap-4 pt-[20px] ">
                    <button
                      className={` bg-red-500 text-white font-semibold px-1 rounded-lg shadow-lg transition-transform duration-200 hover:bg-red-700 hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none`}
                      onClick={() => paymentCard(productDetail)}
                      disabled={
                        productDetail?.status === "Unavailable" ||
                        productDetail?.status === "Discontinued"
                      }
                    >
                      Mua ngay
                    </button>

                    <button
                      className={` bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform duration-200 hover:bg-yellow-600 hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none`}
                      onClick={() => addCart(productDetail)}
                      disabled={
                        productDetail?.status === "Unavailable" ||
                        productDetail?.status === "Discontinued"
                      }
                    >
                      Thêm vào giỏ
                    </button>
                         <button
                      className={` bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform duration-200 hover:bg-yellow-600 hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none`}
                     onClick={handleBorrowBook}
                     disabled={
                          productDetail?.status === "Unavailable" ||
                          productDetail?.status === "Discontinued"
                        }
                    >
                      Mượn sách
                    </button>
                    {/* <div className="product-actions"> */}
                      {/* Nút mượn sách */}
                      {/* <Button
                        type="default"
                        icon={<BookOutlined />}
                        onClick={handleBorrowBook}
                        className="px-1 py-2"
                        disabled={
                          productDetail?.status === "Unavailable" ||
                          productDetail?.status === "Discontinued"
                        }
                        style={{ marginLeft: "10px" }}
                        
                      >
                        Mượn sách
                      </Button> */}
                    {/* </div> */}
                  </div>
                </Card>
              </Col>
            </Row>
            <div className="pt-12 mb-12">
              <div className=" text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-red-600">
                Giới thiệu sách "{productDetail.name}"
              </div>
              <div
                className=" w-full p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 ease-in-out text-base leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: productDetail.description }}
              ></div>
            </div>

            <div className="price" style={{ marginTop: 40 }}>
              <h1 className="product_name">Sản phẩm bạn có thể quan tâm</h1>
            </div>
            <Row
              style={{ marginTop: 40 }}
              gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
              className="row-product"
            >
              {recommend?.slice(0, 4).map(
                (
                  item // Sử dụng slice để lấy 4 sản phẩm đầu tiên
                ) => (
                  <Col
                    xl={{ span: 6 }}
                    lg={{ span: 6 }}
                    md={{ span: 12 }}
                    sm={{ span: 12 }}
                    xs={{ span: 24 }}
                    className="col-product"
                    onClick={() => handleReadMore(item._id)}
                    key={item._id}
                  >
                    <div className="show-product">
                      {item.image ? (
                        <img className="image-product" src={item.image} />
                      ) : (
                        <img
                          className="image-product"
                          src={require("../../../assets/image/NoImageAvailable.jpg")}
                        />
                      )}
                      <div className="wrapper-products">
                        <Paragraph
                          className="title-product"
                          ellipsis={{ rows: 2 }}
                        >
                          {item.name}
                        </Paragraph>
                        <div className="price-amount">
                          <React.Fragment>
                            {item?.salePrice === item?.price ? (
                              <Paragraph className="price-product">
                                {numberWithCommas(item.salePrice)} đ
                              </Paragraph>
                            ) : (
                              <React.Fragment>
                                <Paragraph className="price-product">
                                  {item?.salePrice &&
                                    numberWithCommas(item.salePrice)}{" "}
                                  đ
                                </Paragraph>
                                <Paragraph className="price-cross">
                                  {item.price && numberWithCommas(item.price)} đ
                                </Paragraph>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        </div>
                      </div>
                    </div>
                    <Paragraph
                      className="badge"
                      style={{ position: "absolute", top: 10, left: 9 }}
                    >
                      <span>Giảm giá</span>
                      <img src={triangleTopRight} />
                    </Paragraph>
                  </Col>
                )
              )}
            </Row>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default ProductDetail;
