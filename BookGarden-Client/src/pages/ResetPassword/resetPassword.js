import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Form, Input, Button, Alert, notification } from "antd";
import axiosClient from "../../apis/axiosClient";
import "./resetPassword.css";

const ResetPassword = () => {
  const [isError, setError] = useState(false);
  let history = useHistory();
  let { id } = useParams();

  const onFinish = async (values) => {
    const resetPassWord = {
      token: id,
      newPassword: values.password,
    };
    try {
      const response = await axiosClient.post(
        "/user/reset-password",
        resetPassWord
      );
      if (response) {
        notification.success({
          message: "Thành công",
          description: "Mật khẩu đã được thay đổi!",
        });
        history.push("/login");
      } else {
        throw new Error("Cập nhật thất bại");
      }
    } catch (error) {
      setError(true);
      notification.error({
        message: "Thất bại",
        description: "Không thể thay đổi mật khẩu!",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-500 to-green-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Đặt Lại Mật Khẩu
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Vui lòng nhập mật khẩu mới của bạn.
        </p>

        {isError && (
          <Alert
            message="Lỗi"
            description="Không thể thay đổi mật khẩu. Vui lòng thử lại."
            type="error"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

        <Form
          name="reset_password"
          layout="vertical"
          onFinish={onFinish}
          className="reset-password-form"
        >
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              className="px-4 py-2 border border-gray-300 rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Xác nhận mật khẩu mới"
              className="px-4 py-2 border border-gray-300 rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-blue-600 text-white  rounded-md hover:bg-blue-700"
            >
              Đặt Lại Mật Khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
