import React, { useState, useEffect } from "react";
import "./dashBoard.css";
import {
  Col,
  Row,
  Typography,
  Spin,
  Card,
  Empty,
  Modal,
  BackTop,
  Tag,
  Breadcrumb,
  Table,
} from "antd";
import {
  DashboardOutlined,
  HomeOutlined,
  ShopTwoTone,
  ContactsTwoTone,
  HddTwoTone,
  ShoppingTwoTone,
  ExclamationCircleTwoTone,
  EditTwoTone,
  CloudTwoTone,
  IdcardTwoTone,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import statisticApi from "../../apis/statistic";
import orderApi from "../../apis/orderApi";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashBoard = () => {
  const [orders, setOrder] = useState([]);
  const [statisticList, setStatisticList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi thống kê tổng
        const statisticRes = await statisticApi.getTotal();
        setStatisticList(statisticRes.data);
        setData(statisticRes.data.data);

        // Gọi đơn hàng mới nhất
        const orderRes = await orderApi.getListOrder({ page: 1, limit: 1000 });
        const sortedOrders = orderRes.data.docs.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrder(sortedOrders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "user",
      key: "username",
      render: (user) => user?.username || "Không rõ",
    },
    {
      title: "Email",
      dataIndex: "user",
      key: "email",
      render: (user) => user?.email || "Không rõ",
    },
    {
      title: "Tổng tiền",
      dataIndex: "orderTotal",
      key: "orderTotal",
      render: (orderTotal) =>
        orderTotal
          ? orderTotal.toLocaleString("vi", {
              style: "currency",
              currency: "VND",
            })
          : "0 VND",
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "billing",
      key: "billing",
      render: (billing) => billing || "Không rõ",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "green" : "blue"} key={status}>
          {status?.toUpperCase() || "Chưa xác định"}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Spin spinning={loading}>
        <div className="container">
          <div style={{ marginTop: 20 }}>
            <Breadcrumb>
              <Breadcrumb.Item href="">
                <HomeOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item href="">
                <DashboardOutlined />
                <span>DashBoard</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <Row gutter={12} style={{ marginTop: 20 }}>
            {/* Thẻ card thống kê */}
            <Col span={6}>
              <Card className="card_total" bordered={false}>
                <div className="card_number">
                  <div>
                    <div className="number_total">
                      {statisticList?.totalIncome?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                    <div className="title_total">Tổng doanh thu</div>
                  </div>
                  <div>
                    <ContactsTwoTone style={{ fontSize: 48 }} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Link to="/account-management">
                <Card className="card_total" bordered={false}>
                  <div className="card_number">
                    <div>
                      <div className="number_total">
                        {statisticList?.userTotal || 0}
                      </div>
                      <div className="title_total">Số người dùng</div>
                    </div>
                    <div>
                      <IdcardTwoTone style={{ fontSize: 48 }} />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
            <Col span={6}>
              <Link to="/product-list">
                <Card className="card_total" bordered={false}>
                  <div className="card_number">
                    <div>
                      <div className="number_total">
                        {statisticList?.productTotal || 0}
                      </div>
                      <div className="title_total">Số sản phẩm</div>
                    </div>
                    <div>
                      <ShopTwoTone style={{ fontSize: 48 }} />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
            <Col span={6}>
              <Link to="/category-list">
                <Card className="card_total" bordered={false}>
                  <div className="card_number">
                    <div>
                      <div className="number_total">
                        {statisticList?.categoryTotal || 0}
                      </div>
                      <div className="title_total">Số danh mục</div>
                    </div>
                    <div>
                      <HddTwoTone style={{ fontSize: 48 }} />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>

            <Col span={6} style={{ marginTop: 10 }}>
              <Link to="/author-list">
                <Card className="card_total" bordered={false}>
                  <div className="card_number">
                    <div>
                      <div className="number_total">
                        {statisticList?.authorTotal || 0}
                      </div>
                      <div className="title_total">Số tác giả</div>
                    </div>
                    <div>
                      <EditTwoTone style={{ fontSize: 48 }} />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
            <Col span={6} style={{ marginTop: 10 }}>
              <Link to="/pulisher-list">
                <Card className="card_total" bordered={false}>
                  <div className="card_number">
                    <div>
                      <div className="number_total">
                        {statisticList?.pulisherTotal || 0}
                      </div>
                      <div className="title_total">Số nhà xuất bản</div>
                    </div>
                    <div>
                      <CloudTwoTone style={{ fontSize: 48 }} />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
            <Col span={6} style={{ marginTop: 10 }}>
              <Link to="/order-list">
                <Card className="card_total" bordered={false}>
                  <div className="card_number">
                    <div>
                      <div className="number_total">
                        {statisticList?.orderTotal}
                      </div>
                      <div className="title_total">Số đơn hàng</div>
                    </div>
                    <div>
                      <ShoppingTwoTone style={{ fontSize: 48 }} />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
            <Col span={6} style={{ marginTop: 10 }}>
              <Link to="/complaint-list">
                <Card className="card_total" bordered={false}>
                  <div className="card_number">
                    <div>
                      <div className="number_total">
                        {statisticList?.complaintTotal}
                      </div>
                      <div className="title_total">Số đơn khiếu nại</div>
                    </div>
                    <div>
                      <ExclamationCircleTwoTone style={{ fontSize: 48 }} />
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          </Row>

          <Col span={20}>
            <div className="chart">
              <div className="chart">
                <div className="title">Thống kê đơn hàng trong 12 tháng</div>
                <ResponsiveContainer width="100%" aspect={2 / 1}>
                  <AreaChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    {/* Gradient màu */}
                    <defs>
                      <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#00c6ff"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0072ff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    {/* Lưới và trục */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#555" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="Total"
                      stroke="#0072ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#total)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
          <Row>
            <Col span={20}>
              <div className="chart">
                <div className="title">Đơn hàng mới nhất</div>
                <div style={{ marginTop: 10 }}>
                  <Table
                    columns={columns}
                    dataSource={orders}
                    pagination={{ position: ["bottomCenter"] }}
                    locale={{ emptyText: <Empty /> }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <BackTop style={{ textAlign: "right" }} />
      </Spin>
    </div>
  );
};

export default DashBoard;
