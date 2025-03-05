import React, { useState, useEffect } from "react";
import { Card, Row, Col, Select, Statistic } from "antd";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import axios from "axios";
import moment from "moment";
import "./BookLoanStatistics.css";

// Đăng ký các components của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const { Option } = Select;

const BookLoanStatistics = () => {
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month() + 1);
  const [loanStats, setLoanStats] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalLoans: 0,
    totalReturned: 0,
    totalOverdue: 0,
    totalPending: 0,
    returnRate: 0,
    totalRevenue: 0
  });

  // Lấy thống kê mượn/trả theo tháng
  const fetchLoanStats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3100/api/book-loan/stats/loan-return?year=${year}${month ? `&month=${month}` : ''}`
      );
      setLoanStats(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê mượn/trả:", error);
    }
  };

  // Lấy thống kê sách mượn nhiều nhất
  const fetchMostBorrowed = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3100/api/book-loan/stats/most-borrowed"
      );
      setMostBorrowed(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê sách mượn nhiều nhất:", error);
    }
  };

  // Lấy thống kê tổng quan
  const fetchOverallStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3100/api/book-loan/stats/overall"
      );
      setOverallStats(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê tổng quan:", error);
    }
  };

  useEffect(() => {
    fetchLoanStats();
    fetchMostBorrowed();
    fetchOverallStats();
  }, [year, month]);

  // Cấu hình chung cho biểu đồ
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let value = context.parsed.y;
            return context.dataset.isRevenue 
              ? value.toLocaleString() + ' triệu đồng'
              : value + ' cuốn';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          padding: 8
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          padding: 8
        }
      }
    }
  };

  // Dữ liệu cho biểu đồ doanh thu
  const revenueData = {
    labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
    datasets: [{
      label: "Doanh thu",
      data: Array.from({ length: 12 }, (_, i) => {
        const monthStr = `Tháng ${i + 1}/${year}`;
        const monthData = loanStats
          .filter(stat => stat.month === monthStr && (stat.type === "Mượn" || stat.type === "Trả"))
          .reduce((sum, stat) => sum + stat.revenue, 0);
        return monthData / 1000000;
      }),
      backgroundColor: "rgba(255, 159, 64, 0.8)",
      borderRadius: 4,
      isRevenue: true
    }]
  };

  // Dữ liệu cho biểu đồ sách mượn
  const borrowedData = {
    labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
    datasets: [{
      label: "Sách mượn",
      data: Array.from({ length: 12 }, (_, i) => {
        const monthStr = `Tháng ${i + 1}/${year}`;
        const monthData = loanStats
          .filter(stat => stat.month === monthStr && stat.type === "Mượn")
          .reduce((sum, stat) => sum + stat.value, 0);
        return monthData;
      }),
      backgroundColor: "rgba(75, 192, 192, 0.8)",
      borderRadius: 4
    }]
  };

  // Dữ liệu cho biểu đồ sách trả
  const returnedData = {
    labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
    datasets: [{
      label: "Sách trả",
      data: Array.from({ length: 12 }, (_, i) => {
        const monthStr = `Tháng ${i + 1}/${year}`;
        const monthData = loanStats
          .filter(stat => stat.month === monthStr && stat.type === "Trả")
          .reduce((sum, stat) => sum + stat.value, 0);
        return monthData;
      }),
      backgroundColor: "rgba(53, 162, 235, 0.8)",
      borderRadius: 4
    }]
  };

  // Dữ liệu cho biểu đồ sách quá hạn
  const overdueData = {
    labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
    datasets: [{
      label: "Sách quá hạn",
      data: Array.from({ length: 12 }, (_, i) => {
        const monthStr = `Tháng ${i + 1}/${year}`;
        const monthData = loanStats
          .filter(stat => stat.month === monthStr && stat.type === "Quá hạn")
          .reduce((sum, stat) => sum + stat.value, 0);
        return monthData;
      }),
      backgroundColor: "rgba(255, 99, 132, 0.8)",
      borderRadius: 4
    }]
  };

  // Cấu hình biểu đồ sách mượn nhiều nhất
  const mostBorrowedData = {
    labels: mostBorrowed.map(book => book.bookName),
    datasets: [
      {
        label: "Số lần mượn",
        data: mostBorrowed.map(book => book.totalBorrows),
        backgroundColor: "rgba(53, 162, 235, 0.8)",
        borderRadius: 5
      },
    ],
  };

  const mostBorrowedOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Top sách được mượn nhiều nhất",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="book-loan-statistics">
      <h2>Thống kê mượn sách</h2>

      {/* Bộ lọc thời gian */}
      <div className="filter-section">
        <Select
          style={{ width: 120 }}
          value={year}
          onChange={setYear}
        >
          {Array.from({ length: 5 }, (_, i) => moment().year() - i).map((y) => (
            <Option key={y} value={y}>{y}</Option>
          ))}
        </Select>
        <Select
          style={{ width: 120 }}
          value={month}
          onChange={setMonth}
          allowClear
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <Option key={m} value={m}>Tháng {m}</Option>
          ))}
        </Select>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title="Tổng số phiếu mượn"
              value={overallStats.totalLoans}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title="Đã trả"
              value={overallStats.totalReturned}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title="Quá hạn"
              value={overallStats.totalOverdue}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistic-card">
            <Statistic
              title="Tỷ lệ trả đúng hạn"
              value={overallStats.returnRate}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="statistic-card">
            <Statistic
              title="Tổng doanh thu dự kiến"
              value={overallStats.totalRevenue}
              suffix="đ"
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ thống kê */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card 
            className="chart-container"
            title="Doanh thu theo tháng"
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <div style={{ height: "300px" }}>
              <Bar options={commonOptions} data={revenueData} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            className="chart-container"
            title="Số sách mượn theo tháng"
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <div style={{ height: "300px" }}>
              <Bar options={commonOptions} data={borrowedData} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            className="chart-container"
            title="Số sách trả theo tháng"
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <div style={{ height: "300px" }}>
              <Bar options={commonOptions} data={returnedData} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            className="chart-container"
            title="Số sách quá hạn theo tháng"
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <div style={{ height: "300px" }}>
              <Bar options={commonOptions} data={overdueData} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ sách mượn nhiều nhất */}
      <Card className="chart-container">
        <Bar options={mostBorrowedOptions} data={mostBorrowedData} />
      </Card>
    </div>
  );
};

export default BookLoanStatistics; 