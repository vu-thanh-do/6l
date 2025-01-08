import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Modal, Form, Input, notification } from "antd";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import userApi from "../../apis/userApi";

const Login = () => {
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] =
    useState(false);
  const [forgotPasswordForm] = Form.useForm();
  const [loginError, setLoginError] = useState(false);
  let history = useHistory();

  const onFinish = (values) => {
    userApi
      .login(values.email, values.password)
      .then((response) => {
        if (
          response.user.role === "isClient" &&
          response.user.status !== "noactive"
        ) {
          notification.success({
            message: "Thông báo",
            description: "Đăng nhập thành công.",
          });
          history.push("/home");
        } else {
          setLoginError(true);
          notification.error({
            message: "Thông báo",
            description: "Bạn không có quyền truy cập vào hệ thống.",
          });
        }
      })
      .catch((error) => {
        setLoginError(true);
        console.error("email or password error", error);
      });
  };

  const handleForgotPasswordSubmit = async () => {
    const values = await forgotPasswordForm.validateFields();
    try {
      const data = { email: values.email };
      await userApi.forgotPassword(data);
      notification.success({
        message: "Thông báo",
        description: "Đã gửi đường dẫn đổi mật khẩu qua email.",
      });
      setForgotPasswordModalVisible(false);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi gửi đường dẫn đổi mật khẩu.",
      });
    }
  };

  const showForgotPasswordModal = () => setForgotPasswordModalVisible(true);
  const handleForgotPasswordCancel = () => setForgotPasswordModalVisible(false);

  return (
    <div
      className="login-page flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474088WIe/background-ke-day-sach_074614605.jpg')",
      }}
    >
      <div className="login-container max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Đăng Nhập
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Vui lòng nhập thông tin để đăng nhập.
        </p>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          className="login-form"
        >
          {loginError && (
            <Form.Item>
              <Alert
                message="Tài khoản hoặc mật khẩu sai"
                type="error"
                showIcon
              />
            </Form.Item>
          )}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              className="rounded-md border-gray-300 focus:border-green-500 focus:ring focus:ring-green-300"
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
              className="rounded-md border-gray-300 focus:border-green-500 focus:ring focus:ring-green-300"
            />
          </Form.Item>
          <Form.Item>
            <Button
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-black font-bold rounded-md"
              type="primary"
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
        <div className="flex justify-between items-center mt-4 text-sm">
          <a
            onClick={showForgotPasswordModal}
            className="text-green-600 hover:text-green-800 cursor-pointer"
          >
            Quên mật khẩu?
          </a>
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-800 font-bold"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
      <Modal
        title="Quên mật khẩu"
        visible={forgotPasswordModalVisible}
        onCancel={handleForgotPasswordCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleForgotPasswordCancel}
            className="rounded-md"
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-md"
            onClick={handleForgotPasswordSubmit}
          >
            Gửi yêu cầu
          </Button>,
        ]}
      >
        <Form
          form={forgotPasswordForm}
          name="forgot_password"
          layout="vertical"
          onFinish={handleForgotPasswordSubmit}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: "email", message: "Email không hợp lệ" },
              { required: true, message: "Vui lòng nhập email" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập email của bạn"
              className="rounded-md border-gray-300 focus:border-green-500 focus:ring focus:ring-green-300"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
