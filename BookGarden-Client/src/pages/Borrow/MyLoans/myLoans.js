import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Modal, message, DatePicker, Space, Descriptions } from "antd";
import moment from "moment";
import axios from "axios";

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [newDueDate, setNewDueDate] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Lấy danh sách phiếu mượn
  const fetchLoans = async (page = 1) => {
    try {
      setLoading(true);
      const local = JSON.parse(localStorage.getItem("user") || "{}");
      const id = local._id;
      const response = await axios.get(
        `http://localhost:3100/api/book-loan/user/${id}?page=${page}&limit=${pagination.pageSize}`
      );
      
      setLoans(response.data.data.docs);
      setPagination({
        ...pagination,
        current: response.data.data.page,
        total: response.data.data.totalDocs
      });
    } catch (error) {
      message.error("Có lỗi xảy ra khi lấy danh sách phiếu mượn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Xử lý gia hạn mượn sách
  const handleExtendLoan = async () => {
    try {
      if (!selectedLoan || !newDueDate) return;

      await axios.post(`http://localhost:3100/api/book-loan/extend/${selectedLoan._id}`, {
        newDueDate: newDueDate.format("YYYY-MM-DD")
      });

      message.success("Gia hạn mượn sách thành công");
      setExtendModalVisible(false);
      fetchLoans(pagination.current);

    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi gia hạn mượn sách");
    }
  };

  // Xử lý trả sách
  const handleReturnBook = async (loanId) => {
    try {
      await axios.post(`http://localhost:3100/api/book-loan/return/${loanId}`);
      message.success("Đã xác nhận trả sách");
      fetchLoans(pagination.current);

    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi trả sách");
    }
  };

  // Hiển thị trạng thái phiếu mượn
  const getLoanStatusTag = (status, isOverdue) => {
    const statusConfig = {
      pending: { color: "gold", text: "Chờ duyệt" },
      borrowed: { color: isOverdue ? "red" : "green", text: isOverdue ? "Quá hạn" : "Đang mượn" },
      extended: { color: isOverdue ? "red" : "blue", text: isOverdue ? "Quá hạn" : "Đã gia hạn" },
      returned: { color: "gray", text: "Đã trả" }
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

  const expandedRowRender = (record) => {
    return (
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Tổng phí mượn">
          {record.totalBorrowFee?.toLocaleString()}đ
        </Descriptions.Item>
        <Descriptions.Item label="Tiền đặt cọc">
          {record.depositFee?.toLocaleString()}đ
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức nhận">
          {getDeliveryMethodTag(record.deliveryMethod)}
        </Descriptions.Item>
        {record.deliveryMethod === "shipping" && (
          <Descriptions.Item label="Phí vận chuyển">
            {record.shippingFee?.toLocaleString()}đ
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Tổng tiền" span={2}>
          {record.totalAmount?.toLocaleString()}đ
        </Descriptions.Item>
        {record.deliveryMethod === "shipping" && record.shippingAddress && (
          <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
            {`${record.shippingAddress.address}, ${record.shippingAddress.ward}, ${record.shippingAddress.district}, ${record.shippingAddress.province}`}
          </Descriptions.Item>
        )}
        {record.note && (
          <Descriptions.Item label="Ghi chú" span={2}>
            {record.note}
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "_id",
      key: "_id",
      width: 100,
      render: (id) => <span>#{id.slice(-6)}</span>
    },
    {
      title: "Danh sách sách",
      dataIndex: "books",
      key: "books",
      render: (books) => (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {books.map((book, index) => (
            <li key={index}>
              {book.name} ({book.borrowDays} ngày - {book.borrowFee?.toLocaleString()}đ)
            </li>
          ))}
        </ul>
      )
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      width: 120
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => getLoanStatusTag(record.status, record.isOverdue)
    },
    {
      title: "Số ngày còn lại",
      key: "remainingDays",
      width: 120,
      render: (_, record) => {
        if (record.status === "returned") return "-";
        if (record.remainingDays < 0) return <Tag color="red">{Math.abs(record.remainingDays)} ngày quá hạn</Tag>;
        return <Tag color="blue">{record.remainingDays} ngày</Tag>;
      }
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => {
        if (record.canReturn || record.canExtend) {
          return (
            <Space>
              {record.canExtend && (
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedLoan(record);
                    setExtendModalVisible(true);
                  }}
                >
                  Gia hạn
                </Button>
              )}
              {record.canReturn && (
                <Button
                  type="link"
                  onClick={() => handleReturnBook(record._id)}
                >
                  Trả sách
                </Button>
              )}
            </Space>
          );
        }
        return null;
      }
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Phiếu mượn sách của tôi</h2>

      <Table
        columns={columns}
        dataSource={loans}
        rowKey="_id"
        loading={loading}
        expandable={{
          expandedRowRender,
          expandRowByClick: true
        }}
        pagination={{
          ...pagination,
          onChange: (page) => fetchLoans(page)
        }}
      />

      <Modal
        title="Gia hạn mượn sách"
        visible={extendModalVisible}
        onOk={handleExtendLoan}
        onCancel={() => {
          setExtendModalVisible(false);
          setSelectedLoan(null);
          setNewDueDate(null);
        }}
        okButtonProps={{ disabled: !newDueDate }}
      >
        <Descriptions column={1}>
          <Descriptions.Item label="Danh sách sách">
            <ul>
              {selectedLoan?.books.map((book, index) => (
                <li key={index}>
                  {book.name} (Hạn trả: {moment(book.dueDate).format("DD/MM/YYYY")})
                </li>
              ))}
            </ul>
          </Descriptions.Item>
        </Descriptions>
        
        <div style={{ marginTop: "20px" }}>
          <p>Chọn ngày trả mới:</p>
          <DatePicker
            onChange={setNewDueDate}
            disabledDate={(current) => {
              if (!selectedLoan) return false;
              // Tìm ngày trả xa nhất trong các sách
              const latestDueDate = moment.max(
                selectedLoan.books.map(book => moment(book.dueDate))
              );
              return current && (
                current < moment().startOf('day') ||
                current > latestDueDate.add(30, 'days')
              );
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MyLoans; 