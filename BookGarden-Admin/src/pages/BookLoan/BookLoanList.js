import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Space, message, Modal, Select, DatePicker } from "antd";
import { useHistory } from "react-router-dom";
import moment from "moment";
import axios from "axios";

const { Option } = Select;

const BookLoanList = () => {
  const history = useHistory();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statusFilter, setStatusFilter] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [borrowDate, setBorrowDate] = useState(null);

  // Lấy danh sách phiếu mượn
  const fetchLoans = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3100/api/book-loan/all?page=${page}&limit=${pagination.pageSize}${statusFilter ? `&status=${statusFilter}` : ''}`
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
  }, [statusFilter]);

  // Xử lý duyệt phiếu mượn
  const handleApproveLoan = async (status) => {
    try {
      if (!selectedLoan) return;

      const data = {
        status,
        borrowDate: status === "borrowed" ? borrowDate?.format("YYYY-MM-DD") : undefined
      };

      await axios.put(`http://localhost:3100/api/book-loan/approve/${selectedLoan._id}`, data);

      message.success("Cập nhật trạng thái phiếu mượn thành công");
      setApproveModalVisible(false);
      setSelectedLoan(null);
      setBorrowDate(null);
      fetchLoans(pagination.current);

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

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "_id",
      key: "_id",
      width: 100,
      render: (id) => <Button type="link" onClick={() => history.push(`/book-loans/${id}`)}>#{id.slice(-6)}</Button>
    },
    {
      title: "Người mượn",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div>
          <div>{user?.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{user?.email}</div>
        </div>
      )
    },
    {
      title: "Số lượng sách",
      dataIndex: "totalBooks",
      key: "totalBooks",
      width: 120,
      align: "center"
    },
    {
      title: "Phương thức nhận",
      dataIndex: "deliveryMethod",
      key: "deliveryMethod",
      width: 150,
      render: (method) => getDeliveryMethodTag(method)
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      align: "right",
      render: (amount) => amount?.toLocaleString() + "đ"
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
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm")
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => {
        if (record.status === "pending") {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setSelectedLoan(record);
                  setApproveModalVisible(true);
                }}
              >
                Duyệt
              </Button>
            </Space>
          );
        }
        return null;
      }
    }
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Quản lý phiếu mượn sách</h2>
        <Select
          style={{ width: 200 }}
          placeholder="Lọc theo trạng thái"
          allowClear
          onChange={setStatusFilter}
        >
          <Option value="pending">Chờ duyệt</Option>
          <Option value="borrowed">Đang mượn</Option>
          <Option value="extended">Đã gia hạn</Option>
          <Option value="returned">Đã trả</Option>
          <Option value="rejected">Từ chối</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={loans}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page) => fetchLoans(page)
        }}
      />

      <Modal
        title="Duyệt phiếu mượn sách"
        visible={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedLoan(null);
          setBorrowDate(null);
        }}
        footer={[
          <Button
            key="reject"
            danger
            onClick={() => handleApproveLoan("rejected")}
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => handleApproveLoan("borrowed")}
            disabled={!borrowDate}
          >
            Duyệt
          </Button>
        ]}
      >
        <div style={{ marginBottom: "16px" }}>
          <h4>Thông tin phiếu mượn:</h4>
          <p>Người mượn: {selectedLoan?.user?.name}</p>
          <p>Số lượng sách: {selectedLoan?.totalBooks} cuốn</p>
          <p>Tổng phí mượn: {selectedLoan?.totalBorrowFee?.toLocaleString()}đ</p>
          <p>Tiền đặt cọc: {selectedLoan?.depositFee?.toLocaleString()}đ</p>
          {selectedLoan?.deliveryMethod === "shipping" && (
            <>
              <p>Phí vận chuyển: {selectedLoan?.shippingFee?.toLocaleString()}đ</p>
              <p>Tổng tiền: {selectedLoan?.totalAmount?.toLocaleString()}đ</p>
            </>
          )}
          <div>
            <h4>Danh sách sách:</h4>
            <ul>
              {selectedLoan?.books?.map((book, index) => (
                <li key={index}>
                  {book.name} ({book.borrowDays} ngày - {book.borrowFee?.toLocaleString()}đ)
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p>Chọn ngày mượn:</p>
          <DatePicker
            style={{ width: "100%" }}
            onChange={setBorrowDate}
            disabledDate={(current) => current && current < moment().startOf('day')}
          />
        </div>
      </Modal>
    </div>
  );
};

export default BookLoanList; 