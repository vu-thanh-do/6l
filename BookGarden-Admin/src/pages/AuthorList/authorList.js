import React, { useState, useEffect } from "react";
import "./authorList.css";
import {
  Col,
  Row,
  Typography,
  Spin,
  Button,
  Card,
  Badge,
  Empty,
  Input,
  Space,
  Form,
  Pagination,
  Modal,
  Popconfirm,
  notification,
  BackTop,
  Tag,
  Breadcrumb,
  Select,
  Table,
} from "antd";
import {
  AppstoreAddOutlined,
  QrcodeOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  FormOutlined,
  TagOutlined,
  EditOutlined,
} from "@ant-design/icons";
import eventApi from "../../apis/eventApi";
import productApi from "../../apis/productsApi";
import { useHistory } from "react-router-dom";
import ProductList from "../ProductList/productList";
import axiosClient from "../../apis/axiosClient";
import { PageHeader } from "@ant-design/pro-layout";
const { confirm } = Modal;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { Title } = Typography;

const AuthorList = () => {
  const [author, setAuthor] = useState([]);
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [total, setTotalList] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [id, setId] = useState();
  const [image, setImage] = useState();

  const history = useHistory();

  const showModal = () => {
    setOpenModalCreate(true);
  };

  const handleOkUser = async (values) => {
    setLoading(true);
    try {
      var formData = new FormData();
      formData.append("image", image);
      await axiosClient
        .post("/uploadFile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const authorList = {
            name: values.name,
            bio: values.bio,
            image: response.image_url,
          };
          return axiosClient.post("/author", authorList).then((response) => {
            if (response === undefined) {
              notification["error"]({
                message: `Thông báo`,
                description: "Tạo tác giả thất bại",
              });
            } else {
              notification["success"]({
                message: `Thông báo`,
                description: "Tạo tác giả thành công",
              });
              setOpenModalCreate(false);
              handleAuthorList();
            }
          });
        });
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateAuthor = async (values) => {
    console.log(image);
    setLoading(true);
    if (image) {
      var formData = new FormData();
      formData.append("image", image);
      await axiosClient
        .post("/uploadFile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          try {
            const authorList = {
              name: values.name,
              bio: values.bio,
              image: response.image_url,
            };
            return axiosClient
              .put("/author/" + id, authorList)
              .then((response) => {
                if (response === undefined) {
                  notification["error"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa tác giả thất bại",
                  });
                } else {
                  notification["success"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa tác giả thành công",
                  });
                  handleAuthorList();
                  setOpenModalUpdate(false);
                }
              });
            setLoading(false);
          } catch (error) {
            throw error;
          }
        });
    } else {
      try {
        const authorList = {
          name: values.name,
          description: values.description,
          slug: values.slug,
        };
        await axiosClient.put("/author/" + id, authorList).then((response) => {
          if (response === undefined) {
            notification["error"]({
              message: `Thông báo`,
              description: "Chỉnh sửa tác giả thất bại",
            });
          } else {
            notification["success"]({
              message: `Thông báo`,
              description: "Chỉnh sửa tác giả thành công",
            });
            handleAuthorList();
            setOpenModalUpdate(false);
          }
        });
        setLoading(false);
      } catch (error) {
        throw error;
      }
    }
  };

  const handleCancel = (type) => {
    if (type === "create") {
      setOpenModalCreate(false);
    } else {
      setOpenModalUpdate(false);
    }
    console.log("Clicked cancel button");
  };

  const handleAuthorList = async () => {
    try {
      await productApi.getListAuthor({ page: 1, limit: 10000 }).then((res) => {
        console.log(res);
        setTotalList(res.totalDocs);
        setAuthor(res.data.docs);
        setLoading(false);
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleDeleteAuthor = async (id) => {
    setLoading(true);
    try {
      await productApi.deleteAuthor(id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Xóa tác giả thất bại",
          });
          setLoading(false);
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Xóa tác giả thành công",
          });
          setCurrentPage(1);
          handleAuthorList();
          setLoading(false);
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleDetailView = (id) => {
    history.push("/author-detail/" + id);
  };

  const handleEditAuthor = (id) => {
    setOpenModalUpdate(true);
    (async () => {
      try {
        const response = await productApi.getDetailAuthor(id);
        setId(id);
        form2.setFieldsValue({
          name: response.data.name,
          bio: response.data.bio,
        });
        console.log(form2);
        setLoading(false);
      } catch (error) {
        throw error;
      }
    })();
  };

  const handleFilter = async (name) => {
    try {
      const res = await productApi.searchAuthor(name);
      setTotalList(res.totalDocs);
      setAuthor(res.data.docs);
    } catch (error) {
      console.log("search to fetch author list:" + error);
    }
  };

  const handleChangeImage = (event) => {
    setImage(event.target.files[0]);
  };

  function NoData() {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const columns = [
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => <img src={image} style={{ height: 60 }} />,
      width: "10%",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div>
          <Row>
            <Button
              size="small"
              icon={<EditOutlined />}
              style={{
                width: 150,
                borderRadius: 5,
                height: 30,
                background: "green",
              }}
              onClick={() => handleEditAuthor(record._id)}
              type="primary"
            >
              {"Chỉnh sửa"}
            </Button>
            <div style={{ marginLeft: 10 }}>
              <Popconfirm
                title="Bạn có chắc chắn xóa tác giả này?"
                onConfirm={() => handleDeleteAuthor(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{
                    width: 150,
                    borderRadius: 5,
                    height: 30,
                    background: "red",
                  }}
                  type="primary"
                >
                  {"Xóa"}
                </Button>
              </Popconfirm>
            </div>
          </Row>
        </div>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        await productApi
          .getListAuthor({ page: 1, limit: 10000 })
          .then((res) => {
            console.log(res);
            setTotalList(res.totalDocs);
            setAuthor(res.data.docs);
            setLoading(false);
          });
      } catch (error) {
        console.log("Failed to fetch author list:" + error);
      }
    })();
  }, []);
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
                <ShoppingOutlined />
                <span>Tác giả</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div style={{ marginTop: 20 }}>
            <div id="my__event_container__list">
              <PageHeader subTitle="" style={{ fontSize: 14 }}>
                <Row>
                  <Col span="18">
                    <Input
                      placeholder="Tìm kiếm"
                      allowClear
                      onChange={handleFilter}
                      style={{ width: 300 }}
                    />
                  </Col>
                  <Col span="6">
                    <Row justify="end">
                      <Space>
                        <Button
                          onClick={showModal}
                          icon={<PlusOutlined />}
                          style={{ marginLeft: 10 }}
                          type="primary"
                        >
                          Tạo tác giả
                        </Button>
                      </Space>
                    </Row>
                  </Col>
                </Row>
              </PageHeader>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <Table
              columns={columns}
              pagination={{ position: ["bottomCenter"] }}
              dataSource={author}
            />
          </div>
        </div>

        <Modal
          title="Tạo tác giả mới"
          visible={openModalCreate}
          style={{ top: 100 }}
          onOk={() => {
            form
              .validateFields()
              .then((values) => {
                form.resetFields();
                handleOkUser(values);
              })
              .catch((info) => {
                console.log("Validate Failed:", info);
              });
          }}
          onCancel={() => handleCancel("create")}
          okText="Hoàn thành"
          cancelText="Hủy"
          width={600}
        >
          <Form
            form={form}
            name="eventCreate"
            layout="vertical"
            initialValues={{
              residence: ["zhejiang", "hangzhou", "xihu"],
              prefix: "86",
            }}
            scrollToFirstError
          >
            <Form.Item
              name="name"
              label="Tên"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Tên" />
            </Form.Item>
            <Form.Item
              name="bio"
              label="Thông tin"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập thông tin!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Thông tin" />
            </Form.Item>

            <Form.Item
              name="image"
              label="Ảnh"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập chọn ảnh!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <input
                type="file"
                onChange={handleChangeImage}
                id="avatar"
                name="file"
                accept="image/png, image/jpeg"
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Chỉnh sửa tác giả"
          visible={openModalUpdate}
          style={{ top: 100 }}
          onOk={() => {
            form2
              .validateFields()
              .then((values) => {
                form2.resetFields();
                handleUpdateAuthor(values);
              })
              .catch((info) => {
                console.log("Validate Failed:", info);
              });
          }}
          onCancel={handleCancel}
          okText="Hoàn thành"
          cancelText="Hủy"
          width={600}
        >
          <Form
            form={form2}
            name="eventCreate"
            layout="vertical"
            initialValues={{
              residence: ["zhejiang", "hangzhou", "xihu"],
              prefix: "86",
            }}
            scrollToFirstError
          >
            <Form.Item
              name="name"
              label="Tên"
              rules={[
                {
                  required: true,
                  message: "Please input your sender name!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Tên" />
            </Form.Item>

            <Form.Item
              name="bio"
              label="Thông tin"
              rules={[
                {
                  required: true,
                  message: "Please input your sender bio!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Bio" />
            </Form.Item>

            <Form.Item name="image" label="Ảnh" style={{ marginBottom: 10 }}>
              <input
                type="file"
                onChange={handleChangeImage}
                id="avatar"
                name="file"
                accept="image/png, image/jpeg"
              />
            </Form.Item>
          </Form>
        </Modal>
        <BackTop style={{ textAlign: "right" }} />
      </Spin>
    </div>
  );
};

export default AuthorList;
