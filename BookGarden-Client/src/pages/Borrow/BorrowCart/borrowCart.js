import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button, message, DatePicker, Typography } from "antd";
import moment from "moment";
import axios from "axios";

const { Text } = Typography;
const BORROW_FEE_PER_DAY = 3000; // Phí mượn mỗi ngày

const BorrowCart = () => {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // Lấy danh sách sách đã chọn để mượn từ localStorage
  useEffect(() => {
    const borrowItems = JSON.parse(localStorage.getItem("borrowItems") || "[]");
    setSelectedBooks(borrowItems);
  }, []);

  // Tính tổng giá trị sách
  const calculateTotalValue = () => {
    return selectedBooks.reduce((total, book) => total + book.price, 0);
  };

  // Tính số ngày mượn
  const calculateBorrowDays = (dueDate) => {
    const today = moment().startOf('day');
    const returnDate = moment(dueDate).startOf('day');
    return returnDate.diff(today, 'days');
  };

  // Tính phí mượn cho một cuốn sách
  const calculateBorrowFee = (dueDate) => {
    const days = calculateBorrowDays(dueDate);
    return days * BORROW_FEE_PER_DAY;
  };

  // Tính tổng phí mượn
  const calculateTotalBorrowFee = () => {
    return selectedBooks.reduce((total, book) => {
      if (!book.dueDate) return total;
      return total + calculateBorrowFee(book.dueDate);
    }, 0);
  };

  // Xử lý khi chọn ngày trả
  const handleDueDateChange = (date, bookId) => {
    if (!date) return;
    
    const days = calculateBorrowDays(date);
    if (days > 30) {
      message.error("Thời gian mượn không được quá 30 ngày");
      return;
    }

    setSelectedBooks(prev => 
      prev.map(book => 
        book.id === bookId 
          ? { 
              ...book, 
              dueDate: date.format("YYYY-MM-DD"),
              borrowDays: days,
              borrowFee: calculateBorrowFee(date)
            }
          : book
      )
    );
  };

  // Xử lý khi xác nhận mượn sách
  const handleBorrowConfirm = async () => {
    try {
      setLoading(true);

      // Kiểm tra xem đã chọn ngày trả cho tất cả sách chưa
      const hasAllDueDates = selectedBooks.every(book => book.dueDate);
      if (!hasAllDueDates) {
        message.error("Vui lòng chọn ngày trả cho tất cả sách");
        return;
      }

      // Kiểm tra số lượng sách mượn
      if (selectedBooks.length > 3) {
        message.error("Bạn chỉ được mượn tối đa 3 cuốn sách");
        return;
      }

      // Chuyển đến trang xác nhận mượn sách
      history.push({
        pathname: "/borrow-confirm",
        state: { 
          selectedBooks,
          totalBooks: selectedBooks.length
        }
      });

    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xóa sách khỏi giỏ mượn
  const handleRemoveBook = (bookId) => {
    const newBooks = selectedBooks.filter(book => book.id !== bookId);
    setSelectedBooks(newBooks);
    localStorage.setItem("borrowItems", JSON.stringify(newBooks));
    message.success("Đã xóa sách khỏi giỏ mượn");
  };

  // Cấu hình các cột trong bảng
  const columns = [
    {
      title: "Tên sách",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author"
    },
    {
      title: "Thể loại",
      dataIndex: "category",
      key: "category"
    },
    {
      title: "Giá sách",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <Text>{price?.toLocaleString()}đ</Text>
      )
    },
    {
      title: "Ngày trả dự kiến",
      key: "dueDate",
      render: (_, record) => (
        <DatePicker
          onChange={(date) => handleDueDateChange(date, record.id)}
          defaultValue={record.dueDate ? moment(record.dueDate) : null}
          disabledDate={(current) => {
            return current && (current < moment().startOf('day') || 
                   current > moment().add(30, 'days'));
          }}
        />
      )
    },
    {
      title: "Số ngày mượn",
      key: "borrowDays",
      render: (_, record) => (
        record.borrowDays ? `${record.borrowDays} ngày` : "-"
      )
    },
    {
      title: "Phí mượn",
      key: "borrowFee",
      render: (_, record) => (
        record.borrowFee ? `${record.borrowFee.toLocaleString()}đ` : "-"
      )
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button 
          type="link" 
          danger
          onClick={() => handleRemoveBook(record.id)}
        >
          Xóa
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Giỏ mượn sách</h2>
      
      <Table
        columns={columns}
        dataSource={selectedBooks}
        rowKey="id"
        pagination={false}
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <Text strong>Tổng giá trị đặt cọc:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong type="danger">{calculateTotalValue().toLocaleString()}đ</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} colSpan={2}>
                <Text strong>Tổng phí mượn:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <Text strong type="danger">{calculateTotalBorrowFee().toLocaleString()}đ</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <Button
          type="primary"
          onClick={handleBorrowConfirm}
          loading={loading}
          disabled={selectedBooks.length === 0}
        >
          Xác nhận mượn ({selectedBooks.length} cuốn)
        </Button>
      </div>
    </div>
  );
};

export default BorrowCart; 