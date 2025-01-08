import React, { useState, useEffect } from "react";
import "./orderDetail.css";
import { Spin, BackTop, Breadcrumb } from "antd";
import { HomeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import orderApi from "../../apis/orderApi";
import { useParams } from "react-router-dom";
import moment from "moment";

const OrderDetail = () => {
  const [order, setOrder] = useState([]);

  const [loading, setLoading] = useState(true);

  const [total, setTotalList] = useState();
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      try {
        await orderApi.getDetailOrder(id).then((res) => {
          console.log(res);
          setTotalList(res.totalDocs);
          setOrder(res);
          setLoading(false);
        });
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
      }
    })();
  }, []);
  console.log(order);
  console.log(order.products);
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
                <ShoppingCartOutlined />
                <span>Chi tiết đơn hàng</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="order-details">
            <h2>Chi tiết đơn hàng</h2>
            <div className="order-info">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Người dùng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng đơn hàng</th>
                    <th>Địa chỉ</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                    <th>Ngày tạo</th>
                    <th>Ngày cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{order._id}</td>
                    <td>{order.user}</td>
                    <td>
                      <div className="order-products">
                        {order?.products?.map((product, index) => (
                          <div key={index} className="product-item">
                            <img
                              src={product.product.image}
                              alt={product.product.name}
                              className="product-image"
                            />
                            <div className="product-details">
                              <span className="product-name">
                                {product.product.name}
                              </span>
                              <span className="product-stock">
                                Số lượng: {product.stock}
                              </span>
                              <div className="product-price">
                                Đơn giá: {product.salePrice * product.stock}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>{order.orderTotal}</td>
                    <td>{order.address}</td>
                    <td>{order.billing}</td>
                    <td>
                      {(() => {
                        switch (order.status) {
                          case "pending":
                            return "Đợi xác nhận";
                          case "confirmed":
                            return "Đã xác nhận";
                          case "shipping":
                            return "Đang vận chuyển";
                          case "shipped successfully":
                            return "Đã giao thành công";
                          case "final":
                            return "Hoàn thành";
                          case "rejected":
                            return "Đã hủy";
                          default:
                            return order.status;
                        }
                      })()}
                    </td>
                    <td>{order.description}</td>
                    <td>
                      {moment(order.createdAt).format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td>
                      {moment(order.updatedAt).format("DD/MM/YYYY HH:mm")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <BackTop style={{ textAlign: "right" }} />
      </Spin>
    </div>
  );
};

export default OrderDetail;
