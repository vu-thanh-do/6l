import React, { useState, useEffect } from "react";
import "./pulisher.css";
import {
  Col,
  Row,
  Typography,
  Spin,
  Button,
  Empty,
  Input,
  Space,
  Form,
  Modal,
  Popconfirm,
  notification,
  BackTop,
  Breadcrumb,
  Table,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  HomeOutlined,
  ShoppingOutlined,
  EditOutlined,
} from "@ant-design/icons";
import productApi from "../../apis/productsApi";
import { useHistory } from "react-router-dom";
import axiosClient from "../../apis/axiosClient";
import { PageHeader } from "@ant-design/pro-layout";
const { confirm } = Modal;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { Title } = Typography;

const PulisherList = () => {
  const [pulisher, setPulisher] = useState([]);
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
          const pulisherList = {
            name: values.name,
            bio: values.bio,
          };
          return axiosClient
            .post("/pulisher", pulisherList)
            .then((response) => {
              if (response === undefined) {
                notification["error"]({
                  message: `Thông báo`,
                  description: "Tạo nhà xuất bản thất bại",
                });
              } else {
                notification["success"]({
                  message: `Thông báo`,
                  description: "Tạo nhà xuất bản thành công",
                });
                setOpenModalCreate(false);
                handlePulisherList();
              }
            });
        });
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdatePulisher = async (values) => {
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
            const pulisherList = {
              name: values.name,
              bio: values.bio,
            };
            return axiosClient
              .put("/pulisher/" + id, pulisherList)
              .then((response) => {
                if (response === undefined) {
                  notification["error"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa nhà xuất bản thất bại",
                  });
                } else {
                  notification["success"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa nhà xuất bản thành công",
                  });
                  handlePulisherList();
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
        const pulisherList = {
          name: values.name,
        };
        await axiosClient
          .put("/pulisher/" + id, pulisherList)
          .then((response) => {
            if (response === undefined) {
              notification["error"]({
                message: `Thông báo`,
                description: "Chỉnh sửa nhà xuất bản thất bại",
              });
            } else {
              notification["success"]({
                message: `Thông báo`,
                description: "Chỉnh sửa nhà xuất bản thành công",
              });
              handlePulisherList();
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

  const handlePulisherList = async () => {
    try {
      await productApi
        .getListPulisher({ page: 1, limit: 10000 })
        .then((res) => {
          console.log(res);
          setTotalList(res.totalDocs);
          setPulisher(res.data.docs);
          setLoading(false);
        });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleDeletePulisher = async (id) => {
    setLoading(true);
    try {
      await productApi.deletePulisher(id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Xóa nhà xuất bản thất bại",
          });
          setLoading(false);
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Xóa nhà xuất bản thành công",
          });
          setCurrentPage(1);
          handlePulisherList();
          setLoading(false);
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleDetailView = (id) => {
    history.push("/pulisher-detail/" + id);
  };

  const handleEditPulisher = (id) => {
    setOpenModalUpdate(true);
    (async () => {
      try {
        const response = await productApi.getDetailPulisher(id);
        setId(id);
        form2.setFieldsValue({
          name: response.data.name,
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
      const res = await productApi.searchPulisher(name);
      setTotalList(res.totalDocs);
      setPulisher(res.data.docs);
    } catch (error) {
      console.log("search to fetch pulisher list:" + error);
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
      title: "Tên",
      dataIndex: "name",
      key: "name",
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
                background: "green", // Màu nền xanh lá
                color: "#fff", // Màu chữ trắng
                border: "none", // Loại bỏ viền
              }}
              onMouseEnter={(e) => (e.target.style.background = "#32CD32")} // Màu nền khi hover
              onMouseLeave={(e) => (e.target.style.background = "green")} // Màu nền khi không hover
              onClick={() => handleEditPulisher(record._id)} // Sự kiện click
            >
              {"Chỉnh sửa"}
            </Button>

            <div style={{ marginLeft: 10 }}>
              <Popconfirm
                title="Bạn có chắc chắn xóa nhà xuất bản này?"
                onConfirm={() => handleDeletePulisher(record._id)}
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
                    background: "red", // Màu nền đỏ
                    color: "#fff", // Màu chữ trắng
                    border: "none", // Loại bỏ viền
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#ff7875")} // Màu nền khi hover
                  onMouseLeave={(e) => (e.target.style.background = "red")} // Màu nền khi không hover
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
          .getListPulisher({ page: 1, limit: 10000 })
          .then((res) => {
            console.log(res);
            setTotalList(res.totalDocs);
            setPulisher(res.data.docs);
            setLoading(false);
          });
      } catch (error) {
        console.log("Failed to fetch pulisher list:" + error);
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
                <span>Nhà xuất bản</span>
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
                          Tạo nhà xuất bản
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
              dataSource={pulisher}
            />
          </div>
        </div>

        <Modal
          title="Tạo nhà xuất bản mới"
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
          </Form>
        </Modal>

        <Modal
          title="Chỉnh sửa nhà xuất bản"
          visible={openModalUpdate}
          style={{ top: 100 }}
          onOk={() => {
            form2
              .validateFields()
              .then((values) => {
                form2.resetFields();
                handleUpdatePulisher(values);
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
          </Form>
        </Modal>
        <BackTop style={{ textAlign: "right" }} />
      </Spin>
    </div>
  );
};

export default PulisherList;
