import React, { useState, useEffect } from "react";
import "./accountManagement.css";
import {
  Button,
  Spin,
  Row,
  Card,
  Popconfirm,
  Table,
  Input,
  Col,
  notification,
  BackTop,
  Tag,
  Breadcrumb,
  Space,
  Popover,
} from "antd";
import {
  HomeOutlined,
  PlusOutlined,
  UserOutlined,
  RedoOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EditOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import userApi from "../../apis/userApi";
import { useHistory } from "react-router-dom";
import { PageHeader } from "@ant-design/pro-layout";

const AccountManagement = () => {
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedInput, setSelectedInput] = useState();

  const history = useHistory();

  const titleCase = (str) => {
    var splitStr = str?.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(" ");
  };

  const handleChangeRole = async (record) => {
    try {
      const params = {
        role: "isAdmin2", // Thay đổi quyền thành admin
      };
      await userApi.updateUser(record._id, params); // Gọi API update user
      notification.success({
        message: "Thành công",
        description: "Thay đổi quyền admin thành công!",
      });
      handleListUser(); // Load lại danh sách người dùng sau khi thay đổi
    } catch (error) {
      console.log("Failed to change role:" + error);
      notification.error({
        message: "Lỗi",
        description: "Thay đổi quyền admin thất bại!",
      });
    }
  };

  const handleChangeRole2 = async (record) => {
    try {
      const params = {
        role: "isClient", // Thay đổi quyền thành admin
      };
      await userApi.updateUser(record._id, params); // Gọi API update user
      notification.success({
        message: "Thành công",
        description: "Thay đổi quyền admin thành công!",
      });
      handleListUser(); // Load lại danh sách người dùng sau khi thay đổi
    } catch (error) {
      console.log("Failed to change role:" + error);
      notification.error({
        message: "Lỗi",
        description: "Thay đổi quyền admin thất bại!",
      });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "index",
      render: (value, item, index) => (page - 1) * 10 + (index + 1),
    },
    {
      title: "Tên",
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <Space size="middle">
          {text == null || text == undefined ? (
            ""
          ) : (
            <p style={{ margin: 0 }}>{titleCase(text)}</p>
          )}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: "12%",
      render: (text, record) => (
        <Space size="middle">
          {text === "isAdmin" ? (
            <Tag
              color="blue"
              key={text}
              style={{ width: 140, textAlign: "center" }}
              icon={<CopyOutlined />}
            >
              Admin
            </Tag>
          ) : text === "isAdmin2" ? ( // Thêm điều kiện cho isAdmin2
            <Tag
              color="purple"
              key={text}
              style={{ width: 140, textAlign: "center" }}
              icon={<CopyOutlined />}
            >
              Admin 2
            </Tag>
          ) : text === "isCompany" ? (
            <Tag
              color="green"
              key={text}
              style={{ width: 140, textAlign: "center" }}
              icon={<CheckCircleOutlined />}
            >
              Công ty
            </Tag>
          ) : (
            <Tag
              color="magenta"
              key={text}
              style={{ width: 140, textAlign: "center" }}
              icon={<CheckCircleOutlined />}
            >
              Khách hàng
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Space size="middle">
          {text === "actived" ? (
            <Tag
              color="green"
              key={text}
              style={{ width: 80, textAlign: "center" }}
            >
              Hoạt động
            </Tag>
          ) : text == "newer" ? (
            <Tag
              color="blue"
              key={text}
              style={{ width: 80, textAlign: "center" }}
            >
              Newer
            </Tag>
          ) : (
            <Tag
              color="default"
              key={text}
              style={{ width: 80, textAlign: "center" }}
            >
              Chặn
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div>
          <Row>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {role === "isAdmin" ? (
                <div>
                  {record.role === "isClient" && (
                    <Popconfirm
                      title="Bạn có muốn thay đổi quyền admin cấp 2 cho tài khoản này không?"
                      onConfirm={() => handleChangeRole(record)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        size="small"
                        icon={<SecurityScanOutlined />}
                        style={{ width: 190, borderRadius: 15, height: 30 }}
                      >
                        {"Thay đổi quyền admin"}
                      </Button>
                    </Popconfirm>
                  )}

                  {record.role === "isAdmin2" && (
                    <Popconfirm
                      title="Bạn có muốn thay đổi quyền thành khách hàng cho tài khoản này không?"
                      onConfirm={() => handleChangeRole2(record)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        size="small"
                        icon={<SecurityScanOutlined />}
                        style={{ width: 190, borderRadius: 15, height: 30 }}
                      >
                        {"Thay đổi quyền Client"}
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              ) : null}

              <div style={{ marginTop: 5 }}>
                {record.status !== "actived" ? (
                  <Popconfirm
                    title="Bạn muốn mở chặn tài khoản này?"
                    onConfirm={() => handleUnBanAccount(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      size="small"
                      icon={<CheckCircleOutlined />}
                      style={{ width: 190, borderRadius: 15, height: 30 }}
                    >
                      {"Mở chặn tài khoản"}
                    </Button>
                  </Popconfirm>
                ) : (
                  // Kiểm tra nếu người dùng không phải là admin thì mới hiển thị nút chặn tài khoản
                  record.role !== "isAdmin" &&
                  record.role !== "isAdmin2" && (
                    <Popconfirm
                      title="Bạn muốn chặn tài khoản này?"
                      onConfirm={() => handleBanAccount(record)}
                      okText="Yes"
                      cancelText="No"
                    ></Popconfirm>
                  )
                )}
              </div>
            </div>
          </Row>
        </div>
      ),
    },
  ];

  const handleListUser = async () => {
    try {
      const response = await userApi.listUserByAdmin({ page: 1, limit: 1000 });
      console.log(response);
      setUser(response.data.docs);
      setLoading(false);
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleUnBanAccount = async (data) => {
    const params = {
      status: "actived",
    };
    try {
      await userApi.unBanAccount(params, data._id).then((response) => {
        if (response.message === "Email already exists") {
          notification["error"]({
            message: `Thông báo`,
            description: "Mở khóa thất bại",
          });
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Mở khóa thành công",
          });
          handleListUser();
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleBanAccount = async (data) => {
    console.log(data);
    const params = {
      status: "noactive",
    };
    try {
      await userApi.banAccount(params, data._id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Chặn thất bại",
          });
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Chặn thành công",
          });
          handleListUser();
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleCreateAccount = () => {
    history.push("/account-create");
  };

  const handleFilterEmail = async (email) => {
    try {
      const response = await userApi.searchUser(email);
      setUser(response.data.docs);
    } catch (error) {
      console.log("search to fetch user list:" + error);
    }
  };

  const [role, setRole] = useState();

  useEffect(() => {
    (async () => {
      try {
        const data = JSON.parse(localStorage.getItem("user"));
        setRole(data.role);

        const response = await userApi.listUserByAdmin({
          page: 1,
          limit: 1000,
        });
        console.log(response);
        setUser(response.data.docs);
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch user list:" + error);
      }
    })();
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <Spin spinning={loading}>
        <div style={{ marginTop: 20, marginLeft: 24 }}>
          <Breadcrumb>
            <Breadcrumb.Item href="">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="">
              <UserOutlined />
              <span>Quản lý tài khoản</span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div id="account">
          <div id="account_container">
            <PageHeader
              subTitle=""
              style={{ fontSize: 14, paddingTop: 20, paddingBottom: 20 }}
            >
              <Row>
                <Col span="12">
                  <Input
                    placeholder="Tìm kiếm"
                    allowClear
                    style={{ width: 300 }}
                    onChange={handleFilterEmail}
                    value={selectedInput}
                  />
                </Col>
                <Col span="12">
                  <Row justify="end">
                    <Button
                      style={{ marginLeft: 10 }}
                      icon={<PlusOutlined />}
                      size="middle"
                      onClick={() => handleCreateAccount()}
                      type="primary"
                    >
                      Tạo tài khoản
                    </Button>
                  </Row>
                </Col>
              </Row>
            </PageHeader>
          </div>
        </div>
        <div style={{ marginTop: 20, marginRight: 5 }}>
          <div id="account">
            <div id="account_container">
              <Card title="Quản lý tài khoản" bordered={false}>
                <Table
                  columns={columns}
                  dataSource={user}
                  pagination={{ position: ["bottomCenter"] }}
                />
              </Card>
            </div>
          </div>
        </div>
        <BackTop style={{ textAlign: "right" }} />
      </Spin>
    </div>
  );
};

export default AccountManagement;
