import Texty from "rc-texty";
import React, { useEffect, useRef, useState } from "react";
import eventApi from "../../apis/eventApi";
import productApi from "../../apis/productApi";
import triangleTopRight from "../../assets/icon/Triangle-Top-Right.svg";
import "../Home/home.css";

import { BackTop, Carousel, Col, Row, Spin } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import { useHistory } from "react-router-dom";
import { numberWithCommas } from "../../utils/common";

const Home = () => {
  const [event, setEvent] = useState([]);
  const [productList, setProductList] = useState([]);
  const [eventListHome, setEventListHome] = useState([]);
  const [totalEvent, setTotalEvent] = useState(Number);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [productsPhone, setProductsPhone] = useState([]);
  const [productsPC, setProductsPC] = useState([]);
  const [productsTablet, setProductsTablet] = useState([]);
  const [visible, setVisible] = useState(true);
  const tawkMessengerRef = useRef();
  const initialCountdownDate = new Date().getTime() + 24 * 60 * 60 * 1000;
  const [countdownDate, setCountdownDate] = useState(
    localStorage.getItem("countdownDate") || initialCountdownDate
  );

  const [timeLeft, setTimeLeft] = useState(
    countdownDate - new Date().getTime()
  );

  const history = useHistory();

  const handlePage = async (page, size) => {
    try {
      const response = await eventApi.getListEvents(page, 8);
      setEventListHome(response.data);
      setTotalEvent(response.total_count);
      setCurrentPage(page);
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleReadMore = (id) => {
    console.log(id);
    history.push("product-detail/" + id);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = { limit: 4, page: 1 };

        const responsePhone = await productApi.getProductsByCategory(
          data,
          "65fd67f2207e1639f49dc016"
        );
        // Lấy 4 sản phẩm đầu tiên
        setProductsPhone(responsePhone.data.docs.slice(0, 4));

        const responsePC = await productApi.getProductsByCategory(
          data,
          "65fd6822207e1639f49dc01a"
        );
        // Lấy 4 sản phẩm đầu tiên
        setProductsPC(responsePC.data.docs.slice(0, 4));

        const responseTablet = await productApi.getProductsByCategory(
          data,
          "65fd6755207e1639f49dbfe4"
        );
        // Lấy 4 sản phẩm đầu tiên
        setProductsTablet(responseTablet.data.docs.slice(0, 4));
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Spin spinning={false}>
      <div
        style={{
          background: "#FFFFFF",
          overflowX: "hidden",
          overflowY: "hidden",
        }}
        className="home"
      >
        <div
          style={{ background: "#FFFFFF" }}
          className="container-banner banner-promotion"
        >
          <Carousel autoplay dots={false}>
            <div className="w-full h-96">
              <img
                src="https://static.vecteezy.com/system/resources/previews/008/558/887/non_2x/book-now-button-book-now-text-web-template-modern-web-banner-template-vector.jpg"
                alt="slide 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full h-96">
              <img
                src="https://www.fitchburgstate.edu/sites/default/files/styles/library_megasearch_sm/public/media/images/2024-06/search-banner-bg.jpg.webp?itok=8SXKf7-b"
                alt="slide 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full h-96">
              <img
                src="https://i.pinimg.com/564x/4d/60/c4/4d60c4bcacc7d285b9d66647d95a27ae.jpg"
                alt="slide 3"
                className="w-full h-full object-cover"
              />
            </div>
          </Carousel>
        </div>

        <div className="image-one">
          <div className="texty-demo">
            <Texty>Khuyến Mãi</Texty>
          </div>
          <div className="texty-title">
            <p>
              Sách <strong style={{ color: "#FF0000" }}>Mới Xuất Bản</strong>
            </p>
          </div>

          <div className="list-products container" key="1">
            <Row
              gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
              className="row-product"
            >
              {productsPhone.map((item) => (
                <Col
                  xl={{ span: 6 }}
                  lg={{ span: 8 }}
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
                        src={require("../../assets/image/NoImageAvailable.jpg")}
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
                  {item?.status === "Unavailable" ||
                  item?.status === "Discontinued" ? (
                    <Paragraph
                      className="badge"
                      style={{ position: "absolute", top: 10, left: 9 }}
                    >
                      {item?.status === "Unavailable" ? (
                        <span>Hết hàng</span>
                      ) : (
                        <span>Ngừng kinh doanh</span>
                      )}
                      <img src={triangleTopRight} alt="Triangle" />
                    </Paragraph>
                  ) : (
                    item?.salePrice !== item?.price && (
                      <Paragraph
                        className="badge"
                        style={{ position: "absolute", top: 10, left: 9 }}
                      >
                        {<span>Giảm giá</span>}
                        <img src={triangleTopRight} alt="Triangle" />
                      </Paragraph>
                    )
                  )}
                </Col>
              ))}
            </Row>
          </div>
        </div>

        <section class="py-10 bg-white sm:py-16 lg:py-24">
          <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="max-w-2xl mx-auto text-center">
              <h2 class="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
                Làm thế nào để mua hàng?
              </h2>
              <p class="max-w-lg mx-auto mt-4 text-base leading-relaxed text-gray-600">
                Đăng ký tài khoản miễn phí để bắt đầu trải nghiệm mua sắm.
              </p>
            </div>

            <div class="relative mt-12 lg:mt-20">
              <div class="absolute inset-x-0 hidden xl:px-44 top-2 md:block md:px-20 lg:px-28">
                <img
                  class="w-full"
                  src="https://cdn.rareblocks.xyz/collection/celebration/images/steps/2/curved-dotted-line.svg"
                  alt=""
                />
              </div>

              <div class="relative grid grid-cols-1 text-center gap-y-12 md:grid-cols-3 gap-x-12">
                <div>
                  <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                    <span class="text-xl font-semibold text-gray-700"> 1 </span>
                  </div>
                  <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">
                    Tạo tài khoản miễn phí
                  </h3>
                  <p class="mt-4 text-base text-gray-600">
                    Đăng ký tài khoản miễn phí để bắt đầu trải nghiệm mua sắm.
                  </p>
                </div>

                <div>
                  <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                    <span class="text-xl font-semibold text-gray-700"> 2 </span>
                  </div>
                  <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">
                    Xây dựng giỏ hàng
                  </h3>
                  <p class="mt-4 text-base text-gray-600">
                    Thêm sản phẩm vào giỏ hàng và tiến hành thanh toán khi đã
                    hoàn tất lựa chọn.
                  </p>
                </div>

                <div>
                  <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                    <span class="text-xl font-semibold text-gray-700"> 3 </span>
                  </div>
                  <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">
                    Thanh toán và Giao hàng
                  </h3>
                  <p class="mt-4 text-base text-gray-600">
                    Hoàn tất thanh toán và chờ nhận sản phẩm tại địa chỉ đã cung
                    cấp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="image-one">
          <div className="texty-demo">
            <Texty>Giờ Vàng</Texty>
          </div>
          <div className="texty-title">
            <p>
              Sách <strong style={{ color: "#FF0000" }}>Bán Chạy</strong>
            </p>
          </div>

          <div className="list-products container" key="1">
            <Row
              gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
              className="row-product"
            >
              {productsPC.map((item) => (
                <Col
                  xl={{ span: 6 }}
                  lg={{ span: 8 }}
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
                        src={require("../../assets/image/NoImageAvailable.jpg")}
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
                  {item?.status === "Unavailable" ||
                  item?.status === "Discontinued" ? (
                    <Paragraph
                      className="badge"
                      style={{ position: "absolute", top: 10, left: 9 }}
                    >
                      {item?.status === "Unavailable" ? (
                        <span>Hết hàng</span>
                      ) : (
                        <span>Ngừng kinh doanh</span>
                      )}
                      <img src={triangleTopRight} alt="Triangle" />
                    </Paragraph>
                  ) : (
                    item?.salePrice !== item?.price && (
                      <Paragraph
                        className="badge"
                        style={{ position: "absolute", top: 10, left: 9 }}
                      >
                        {<span>Giảm giá</span>}
                        <img src={triangleTopRight} alt="Triangle" />
                      </Paragraph>
                    )
                  )}
                </Col>
              ))}
            </Row>
          </div>
        </div>

        <div className="image-one">
          <div className="texty-demo">
            <Texty>Giờ Vàng</Texty>
          </div>
          <div className="texty-title">
            <p>
              Giảm Giá <strong style={{ color: "#FF0000" }}>Đặc Biệt</strong>
            </p>
          </div>

          <div className="list-products container" key="1">
            <Row></Row>
            <Row
              gutter={{ xs: 8, sm: 16, md: 24, lg: 48 }}
              className="row-product"
            >
              {productsTablet.map((item) => (
                <Col
                  xl={{ span: 6 }}
                  lg={{ span: 8 }}
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
                        src={require("../../assets/image/NoImageAvailable.jpg")}
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
                  {item?.status === "Unavailable" ||
                  item?.status === "Discontinued" ? (
                    <Paragraph
                      className="badge"
                      style={{ position: "absolute", top: 10, left: 9 }}
                    >
                      {item?.status === "Unavailable" ? (
                        <span>Hết hàng</span>
                      ) : (
                        <span>Ngừng kinh doanh</span>
                      )}
                      <img src={triangleTopRight} alt="Triangle" />
                    </Paragraph>
                  ) : (
                    item?.salePrice !== item?.price && (
                      <Paragraph
                        className="badge"
                        style={{ position: "absolute", top: 10, left: 9 }}
                      >
                        {<span>Giảm giá</span>}
                        <img src={triangleTopRight} alt="Triangle" />
                      </Paragraph>
                    )
                  )}
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>

      <BackTop style={{ textAlign: "right" }} />
    </Spin>
  );
};

export default Home;
