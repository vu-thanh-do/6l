import React, { useState, useEffect } from "react";
import "./news.css";
import { DatePicker, Input, Spin, Breadcrumb } from "antd";
import {
  Card,
  Table,
  Space,
  Tag,
  PageHeader,
  Divider,
  Form,
  List,
  notification,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  AimOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import axiosClient from "../../apis/axiosClient";
import productApi from "../../apis/productApi";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";

const { Search } = Input;

const News = () => {
  const [news, setNews] = useState([]);
  let history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        await productApi.getNews().then((item) => {
          setNews(item.data.docs);
        });
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
    window.scrollTo(0, 0);
  }, []);
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
                <Breadcrumb.Item href="http://localhost:3500/news">
                  {/* <AuditOutlined /> */}
                  <span>Tin tức</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div className="news p-4">
              <div className="newstitle text-center mb-4">
                <h2 style={{ fontWeight: "bold", color: "#2c3e50" }}>
                  TIN TỨC MỚI NHẤT
                </h2>
              </div>
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 4,
                  xxl: 4,
                }}
                dataSource={news}
                renderItem={(item) => (
                  <Link to={`/news/${item._id}`}>
                    <Card
                      hoverable
                      style={{
                        margin: "10px",
                        borderRadius: "15px",
                        overflow: "hidden",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        height: "350px", // Đặt chiều cao cố định cho toàn bộ thẻ
                        display: "flex",
                        flexDirection: "column", // Đảm bảo nội dung trong thẻ sắp xếp từ trên xuống
                        justifyContent: "space-between", // Duy trì khoảng cách đồng đều
                      }}
                      bodyStyle={{ padding: "10px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <div
                        style={{
                          padding: "10px",
                          fontWeight: "600",
                          fontSize: "16px",
                          color: "#34495e",
                          flex: "1", // Chiếm không gian còn lại nếu cần
                        }}
                      >
                        {item.name}
                      </div>
                      <img
                        src={item.image}
                        alt="News Image"
                        style={{
                          width: "100%",
                          height: "200px", // Chiều cao cố định cho hình ảnh
                          objectFit: "cover",
                          borderRadius: "0 0 15px 15px",
                        }}
                      />
                    </Card>
                  </Link>
                )}
              />
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default News;
