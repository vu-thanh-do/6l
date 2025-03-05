import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Card, Descriptions, Table, Tag, Button, Space, message, Modal, DatePicker } from "antd";
import moment from "moment";
import axios from "axios";

const BookLoanDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [newDueDate, setNewDueDate] = useState(null);

  // Lấy chi tiết phiếu mượn
  const fetchLoanDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3100/api/book-loan/${id}`);
      setLoan(response.data.data);
    } catch (error) {
      message.error("Có lỗi xảy ra khi lấy chi tiết phiếu mượn");
      history.push("/book-loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanDetail();
  }, [id]);

  // Xử lý gia hạn mượn sách
  const handleExtendLoan = async () => {
    try {
      if (!newDueDate) return;

      await axios.put(`http://localhost:3100/api/book-loan/extend/${id}`, {
        newDueDate: newDueDate.format("YYYY-MM-DD")
      });

      message.success("Gia hạn mượn sách thành công");
      setExtendModalVisible(false);
      setNewDueDate(null);
      fetchLoanDetail();

    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Xử lý trả sách
  const handleReturnBook = async () => {
    try {
      await axios.put(`http://localhost:3100/api/book-loan/return/${id}`);
      message.success("Đã xác nhận trả sách");
      fetchLoanDetail();

    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Hiển thị trạng thái phiếu mượn
  const getLoanStatusTag = (status, isOverdue) => {
    const statusConfig = {
      pending: { color: "gold", text: "Chờ duyệt" },
      borrowed: { color: isOverdue ? "red" : "green", text: isOverdue ? "Quá hạn" : "Đang mượn" },
      extended: { color: isOverdue ? "red" : "blue", text: isOverdue ? "Quá hạn" : "Đã gia hạn" },
      returned: { color: "gray", text: "Đã trả" },
      rejected: { color: "red", text: "Từ chối" }
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Hiển thị phương thức nhận sách
  const getDeliveryMethodTag = (method) => {
    const methodConfig = {
      pickup: { color: "blue", text: "Nhận tại thư viện" },
      shipping: { color: "green", text: "Giao hàng" }
    };

    const config = methodConfig[method] || { color: "default", text: method };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const bookColumns = [
    {
      title: "Tên sách",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Số ngày mượn",
      dataIndex: "borrowDays",
      key: "borrowDays",
      align: "center"
    },
    {
      title: "Phí mượn",
      dataIndex: "borrowFee",
      key: "borrowFee",
      align: "right",
      render: (fee) => fee?.toLocaleString() + "đ"
    },
    {
      title: "Ngày trả dự kiến",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => moment(date).format("DD/MM/YYYY")
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const isOverdue = moment(record.dueDate).isBefore(moment(), "day");
        return getLoanStatusTag(record.status, isOverdue);
      }
    }
  ];

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!loan) {
    return <div>Không tìm thấy phiếu mượn</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Chi tiết phiếu mượn #{loan._id.slice(-6)}</h2>
        <Space>
          {loan.status === "borrowed" && (
            <Button type="primary" onClick={() => setExtendModalVisible(true)}>
              Gia hạn
            </Button>
          )}
          {loan.status === "borrowed" && (
            <Button type="primary" onClick={handleReturnBook}>
              Xác nhận trả sách
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ marginBottom: "24px" }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Người mượn">
            <div>
              <div>{loan.user?.name}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{loan.user?.email}</div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {loan.user?.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức nhận">
            {getDeliveryMethodTag(loan.deliveryMethod)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {moment(loan.createdAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng phí mượn">
            {loan.totalBorrowFee?.toLocaleString()}đ
          </Descriptions.Item>
          <Descriptions.Item label="Tiền đặt cọc">
            {loan.depositFee?.toLocaleString()}đ
          </Descriptions.Item>
          {loan.deliveryMethod === "shipping" && (
            <>
              <Descriptions.Item label="Phí vận chuyển">
                {loan.shippingFee?.toLocaleString()}đ
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {loan.totalAmount?.toLocaleString()}đ
              </Descriptions.Item>
            </>
          )}
          {loan.deliveryMethod === "shipping" && loan.shippingAddress && (
            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
              {`${loan.shippingAddress.address}, ${loan.shippingAddress.ward}, ${loan.shippingAddress.district}, ${loan.shippingAddress.province}`}
            </Descriptions.Item>
          )}
          {loan.note && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {loan.note}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Danh sách sách mượn">
        <Table
          columns={bookColumns}
          dataSource={loan.books}
          rowKey="_id"
          pagination={false}
        />
      </Card>

      <Modal
        title="Gia hạn mượn sách"
        visible={extendModalVisible}
        onOk={handleExtendLoan}
        onCancel={() => {
          setExtendModalVisible(false);
          setNewDueDate(null);
        }}
        okButtonProps={{ disabled: !newDueDate }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h4>Danh sách sách:</h4>
          <ul>
            {loan.books.map((book, index) => (
              <li key={index}>
                {book.name} (Hạn trả: {moment(book.dueDate).format("DD/MM/YYYY")})
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p>Chọn ngày trả mới:</p>
          <DatePicker
            style={{ width: "100%" }}
            onChange={setNewDueDate}
            disabledDate={(current) => {
              if (!current) return false;
              // Tìm ngày trả xa nhất trong các sách
              const latestDueDate = moment.max(
                loan.books.map(book => moment(book.dueDate))
              );
              return current < moment().startOf('day') || current > latestDueDate.add(30, 'days');
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default BookLoanDetail; 