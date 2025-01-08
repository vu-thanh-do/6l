import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { AuditOutlined, HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Card, Result, Spin, Steps } from "antd";
import { useHistory, useParams } from "react-router-dom";
import productApi from "../../../apis/productApi";
import userApi from "../../../apis/userApi";
import "./finalPay.css";
import { Link } from "react-router-dom";
const FinalPay = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState([]);
  const [showConfetti, setShowConfetti] = useState(true); // Hiển thị pháo hoa
  let { id } = useParams();
  const history = useHistory();

  const handleFinal = () => {
    history.push("/");
  };

  useEffect(() => {
    (async () => {
      try {
        const item = await productApi.getDetailProduct(id);
        setProductDetail(item);

        const response = await userApi.getProfile();
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const transformedData = cart.map(
          ({ _id: product, stock, salePrice }) => ({
            product,
            stock,
            salePrice,
          })
        );

        let totalPrice = 0;
        for (let i = 0; i < transformedData.length; i++) {
          totalPrice += transformedData[i].salePrice * transformedData[i].stock;
        }

        setOrderTotal(totalPrice);
        setProductDetail(transformedData);
        setUserData(response.user);
        setLoading(false);

        setTimeout(() => setShowConfetti(false), 5000); // Tắt pháo hoa sau 5 giây
      } catch (error) {
        console.log("Failed to fetch event detail:", error);
      }
    })();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="py-5">
      {showConfetti && <Confetti />}
      <Spin spinning={loading}>
        <Card className="container">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="">
                  <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <AuditOutlined />
                  <span>Thanh toán</span>
                </Breadcrumb.Item>
              </Breadcrumb>

              <div className="payment_progress">
                <Steps
                  current={2}
                  percent={100}
                  items={[
                    {
                      title: "Chọn sản phẩm",
                    },
                    {
                      title: "Thanh toán",
                    },
                    {
                      title: "Hoàn thành",
                    },
                  ]}
                />
              </div>
              <Result
                status="success"
                title="Đặt hàng thành công !"
                subTitle={
                  <>
                    Bạn có thể xem lịch sử đặt hàng ở{" "}
                    <Link
                      to="/cart-history"
                      className="text-blue-500 hover:underline"
                    >
                      quản lý đơn hàng
                    </Link>
                    .
                  </>
                }
                extra={[
                  <button
                    key="console"
                    onClick={handleFinal}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg text-lg"
                  >
                    Hoàn thành
                  </button>,
                ]}
              />
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default FinalPay;
