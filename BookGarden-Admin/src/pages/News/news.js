import React, { useState, useEffect } from "react";
import "./news.css";
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
  BarsOutlined,
  FormOutlined,
  TagOutlined,
  EditOutlined,
} from "@ant-design/icons";
import eventApi from "../../apis/eventApi";
import newsApi from "../../apis/newsApi";
import { useHistory } from "react-router-dom";
import ProductList from "../ProductList/productList";
import axiosClient from "../../apis/axiosClient";
import "suneditor/dist/css/suneditor.min.css";
import SunEditor from "suneditor-react";
import { PageHeader } from "@ant-design/pro-layout";
const { confirm } = Modal;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { Title } = Typography;

const NewsList = () => {
  const [newsList, setNewsList] = useState([]);
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [total, setTotalList] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [id, setId] = useState();
  const [image, setImage] = useState();
  const [description, setDescription] = useState();

  const history = useHistory();

  const showModal = () => {
    setOpenModalCreate(true);
  };

  const handleChangeImage = (event) => {
    setImage(event.target.files[0]);
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
          const categoryList = {
            name: values.name,
            description: description,
            image: response.image_url,
          };
          return axiosClient.post("/news", categoryList).then((response) => {
            if (response === undefined) {
              notification["error"]({
                message: `Thông báo`,
                description: "Tạo tin tức thất bại",
              });
            } else {
              notification["success"]({
                message: `Thông báo`,
                description: "Tạo tin tức thành công",
              });
              setOpenModalCreate(false);
              handleCategoryList();
            }
          });
        });

      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateCategory = async (values) => {
    console.log(values);
    setLoading(true);
    try {
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
            const categoryList = {
              name: values.name,
              description: description,
              category: values.category,
              image: response.image_url,
            };

            return axiosClient
              .put("/news/" + id, categoryList)
              .then((response) => {
                if (response === undefined) {
                  notification["error"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa tin tức thất bại",
                  });
                } else {
                  notification["success"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa tin tức thành công",
                  });
                  handleCategoryList();
                  setOpenModalUpdate(false);
                  setLoading(false);
                }
              });
          });
      } else {
        // Nếu image không tồn tại, chỉ gọi API put
        const categoryList = {
          name: values.name,
          description: description,
          category: values.category,
        };

        return axiosClient.put("/news/" + id, categoryList).then((response) => {
          if (response === undefined) {
            notification["error"]({
              message: `Thông báo`,
              description: "Chỉnh sửa tin tức thất bại",
            });
          } else {
            notification["success"]({
              message: `Thông báo`,
              description: "Chỉnh sửa tin tức thành công",
            });
            handleCategoryList();
            setOpenModalUpdate(false);
            setLoading(false);
          }
        });
      }
    } catch (error) {
      throw error;
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

  const handleCategoryList = async () => {
    try {
      await newsApi.getListNews({ page: 1, limit: 10 }).then((res) => {
        console.log(res);
        setTotalList(res.totalDocs);
        setNewsList(res.data.docs);
        setLoading(false);
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await newsApi.deleteNews(id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Xóa tin tức thất bại",
          });
          setLoading(false);
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Xóa tin tức thành công",
          });
          setCurrentPage(1);
          handleCategoryList();
          setLoading(false);
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleChange = (content) => {
    console.log(content);
    setDescription(content);
  };

  const handleEditCategory = (id) => {
    setOpenModalUpdate(true);
    (async () => {
      try {
        const response = await newsApi.getDetailNews(id);
        setId(id);
        form2.setFieldsValue({
          name: response.data.name,
          slug: response.data.slug,
          description: response.data.description,
        });
        console.log(form2);
        setDescription(response.data.description);

        setLoading(false);
      } catch (error) {
        throw error;
      }
    })();
  };

  const handleFilter = async (name) => {
    try {
      const res = await newsApi.searchNews(name);
      setTotalList(res.totalDocs);
      setNewsList(res.data.docs);
    } catch (error) {
      console.log("search to fetch news list:" + error);
    }
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
      render: (image) => <img src={image} style={{ height: 80 }} />,
      width: "20%",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    // {
    //     title: 'Mô tả',
    //     dataIndex: 'description',
    //     key: 'description',
    //     render: (text) => <div className='box_detail_description' dangerouslySetInnerHTML={{ __html: text }}></div>
    // },
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
              onClick={() => handleEditCategory(record._id)}
              type="primary"
            >
              {"Chỉnh sửa"}
            </Button>
            <div style={{ marginLeft: 10 }}>
              <Popconfirm
                title="Bạn có chắc chắn xóa tin tức này?"
                onConfirm={() => handleDeleteCategory(record._id)}
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
        await newsApi.getListNews({ page: 1, limit: 10 }).then((res) => {
          console.log(res);
          setTotalList(res.totalDocs);
          setNewsList(res.data.docs);
          setLoading(false);
        });
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
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
                <BarsOutlined />
                <span>Tin tức</span>
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
                          Tạo tin tức
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
              dataSource={newsList}
            />
          </div>
        </div>

        <Modal
          title="Tạo tin tức mới"
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
          width={800}
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
                  message: "Please input your sender name!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Tên" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mô tả!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <SunEditor
                lang="en"
                placeholder="Content"
                onChange={handleChange}
                setContents={description}
                setOptions={{
                  buttonList: [
                    ["undo", "redo"],
                    ["font", "fontSize"],
                    // ['paragraphStyle', 'blockquote'],
                    [
                      "bold",
                      "underline",
                      "italic",
                      "strike",
                      "subscript",
                      "superscript",
                    ],
                    ["fontColor", "hiliteColor"],
                    ["align", "list", "lineHeight"],
                    ["outdent", "indent"],

                    ["table", "horizontalRule", "link", "image", "video"],
                    // ['math'] //You must add the 'katex' library at options to use the 'math' plugin.
                    // ['imageGallery'], // You must add the "imageGalleryUrl".
                    // ["fullScreen", "showBlocks", "codeView"],
                    ["preview", "print"],
                    ["removeFormat"],

                    // ['save', 'template'],
                    // '/', Line break
                  ],
                  fontSize: [8, 10, 14, 18, 24], // Or Array of button list, eg. [['font', 'align'], ['image']]
                  defaultTag: "div",
                  minHeight: "300px",
                  showPathLabel: false,
                  attributesWhitelist: {
                    all: "style",
                    table: "cellpadding|width|cellspacing|height|style",
                    tr: "valign|style",
                    td: "styleinsert|height|style",
                    img: "title|alt|src|style",
                  },
                }}
              />
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
          title="Chỉnh sửa tin tức"
          visible={openModalUpdate}
          style={{ top: 100 }}
          onOk={() => {
            form2
              .validateFields()
              .then((values) => {
                form2.resetFields();
                handleUpdateCategory(values);
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
              name="description"
              label="Mô tả"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mô tả!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <SunEditor
                lang="en"
                placeholder="Content"
                onChange={handleChange}
                setContents={description}
                setOptions={{
                  buttonList: [
                    ["undo", "redo"],
                    ["font", "fontSize"],
                    // ['paragraphStyle', 'blockquote'],
                    [
                      "bold",
                      "underline",
                      "italic",
                      "strike",
                      "subscript",
                      "superscript",
                    ],
                    ["fontColor", "hiliteColor"],
                    ["align", "list", "lineHeight"],
                    ["outdent", "indent"],

                    ["table", "horizontalRule", "link", "image", "video"],
                    // ['math'] //You must add the 'katex' library at options to use the 'math' plugin.
                    // ['imageGallery'], // You must add the "imageGalleryUrl".
                    // ["fullScreen", "showBlocks", "codeView"],
                    ["preview", "print"],
                    ["removeFormat"],

                    // ['save', 'template'],
                    // '/', Line break
                  ],
                  fontSize: [8, 10, 14, 18, 24], // Or Array of button list, eg. [['font', 'align'], ['image']]
                  defaultTag: "div",
                  minHeight: "300px",
                  showPathLabel: false,
                  attributesWhitelist: {
                    all: "style",
                    table: "cellpadding|width|cellspacing|height|style",
                    tr: "valign|style",
                    td: "styleinsert|height|style",
                    img: "title|alt|src|style",
                  },
                }}
              />
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

export default NewsList;
