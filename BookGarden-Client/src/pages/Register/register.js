import React from "react";
import "./register.css";
import { Input, Card, Form, Button, notification, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useHistory, Link } from "react-router-dom";
import axiosClient from "../../apis/axiosClient";

const { Title, Text } = Typography;

const RegisterCustomer = () => {
  const history = useHistory();

  const onFinish = async (values) => {
    const formatData = {
      email: values.email,
      username: values.username,
      password: values.password,
      phone: values.phoneNo,
      role: "isClient",
      status: "actived",
    };

    try {
      const response = await axiosClient.post(
        "http://localhost:3100/api/auth/register",
        formatData
      );
      if (response === "Email is exist") {
        notification.error({
          message: "Thông báo",
          description: "Email đã tồn tại",
        });
      } else if (!response) {
        notification.error({
          message: "Thông báo",
          description: "Đăng ký thất bại",
        });
      } else {
        notification.success({
          message: "Thông báo",
          description: "Đăng kí thành công",
        });
        setTimeout(() => history.push("/login"), 1000);
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại sau!",
      });
    }
  };

  return (
    <div
      className="register-page bg-cover bg-center min-h-screen flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474088WIe/background-ke-day-sach_074614605.jpg')",
      }}
    >
      <div className="register-container max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <Card className="register-card border-0">
          <Title level={3} className="register-title text-center text-gray-800">
            Đăng Kí Tài Khoản
          </Title>
          <Text
            type="secondary"
            className="register-description block text-center mb-6 text-gray-600"
          >
            Vui lòng điền thông tin bên dưới để tạo tài khoản mới.
          </Text>
          <Form
            name="register"
            layout="vertical"
            className="register-form"
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              label="Tên hiển thị"
              rules={[
                { required: true, message: "Vui lòng nhập tên hiển thị!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Tên hiển thị"
                size="large"
                className="rounded-md"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
                className="rounded-md"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                size="large"
                className="rounded-md"
              />
            </Form.Item>
            <Form.Item
              name="phoneNo"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10,15}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Số điện thoại"
                size="large"
                className="rounded-md"
              />
            </Form.Item>
            <Form.Item style={{ marginTop: 20 }}>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
                type="primary"
                htmlType="submit"
              >
                Đăng Kí
              </Button>
            </Form.Item>
            <div className="register-footer text-center mt-4">
              <Text className="text-gray-600">
                Đã có tài khoản?{" "}
                <Link to="/login" className="register-login-link text-blue-600">
                  Đăng nhập
                </Link>
              </Text>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterCustomer;
