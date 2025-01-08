import React, { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  Input,
  Form,
  Modal,
  notification,
  BackTop,
  Select,
  Table,
} from "antd";
import productApi from "../../apis/productsApi";
import { useHistory } from "react-router-dom";
import axiosClient from "../../apis/axiosClient";
const { confirm } = Modal;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { Title } = Typography;
const Complaint = () => {
  const [category, setCategory] = useState([]);
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [total, setTotalList] = useState();
  const [id, setId] = useState();
  const [image, setImage] = useState();

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
          const categoryList = {
            name: values.name,
            image: response.image_url,
          };
          return axiosClient
            .post("/category", categoryList)
            .then((response) => {
              if (response === undefined) {
                notification["error"]({
                  message: `Thông báo`,
                  description: "Tạo danh mục thất bại",
                });
              } else {
                notification["success"]({
                  message: `Thông báo`,
                  description: "Tạo danh mục thành công",
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
            const categoryList = {
              name: values.name,
              description: values.description,
              slug: values.slug,
              image: response.image_url,
            };
            return axiosClient
              .put("/category/" + id, categoryList)
              .then((response) => {
                if (response === undefined) {
                  notification["error"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa danh mục thất bại",
                  });
                } else {
                  notification["success"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa danh mục thành công",
                  });
                  handleCategoryList();
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
        const categoryList = {
          name: values.name,
          description: values.description,
          slug: values.slug,
        };

        await axiosClient
          .put("/category/" + id, categoryList)
          .then((response) => {
            if (response === undefined) {
              notification["error"]({
                message: `Thông báo`,
                description: "Chỉnh sửa danh mục thất bại",
              });
            } else {
              notification["success"]({
                message: `Thông báo`,
                description: "Chỉnh sửa danh mục thành công",
              });
              handleCategoryList();
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

  const handleCategoryList = async () => {
    try {
      await productApi
        .getListCategory({ page: 1, limit: 10000 })
        .then((res) => {
          console.log(res);
          setTotalList(res.totalDocs);
          // setCategory(res.data.docs);
          setLoading(false);
        });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleChangeImage = (event) => {
    setImage(event.target.files[0]);
  };

  const columns = [
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (image) => {
        const checkStatus = {
          finalcomplaint: "Đã hoàn thành",
          pendingcomplaint: "Đang chờ",
          acceptcomplaint: "Đã duyệt",
          refundcomplaint: "Đang hoàn trả",
          final: "Đã hủy",
        };
        return <p>{checkStatus[image]}</p>;
      },
    },
    {
      title: "Tên khách hàng",
      dataIndex: "user",
      key: "user",
      render: (image) => <p>{image?.username}</p>,
    },
    {
      title: "SĐT khách hàng",
      dataIndex: "user",
      key: "user",
      render: (image) => <p>{image?.phone}</p>,
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (text) => {
        const checkStatus = {
          "wrong-item": "Giao sai hàng",
          damaged: "Sản phẩm bị hư hỏng",
          other: "Khác",
        };
        return <a>{checkStatus[text]}</a>;
      },
    },
    {
      title: "Chi tiết",
      dataIndex: "description",
      key: "description",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Ảnh mô tả",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <a>
          {text?.map((itc) => (
            <>
              <img src={itc} style={{ width: "100px" }} /> <br />
            </>
          ))}
        </a>
      ),
    },

    {
      title: "Action",
      key: "action",
      width: "20%",
      render: (text, record) => {
        console.log(record, "record");
        const statusFlow = {
          pendingcomplaint: ["acceptcomplaint", "final"], // Có thể hủy khiếu nại từ trạng thái "Đang chờ"
          acceptcomplaint: ["refundcomplaint"], // Có thể hủy khiếu nại từ trạng thái "Đã duyệt"
          refundcomplaint: ["finalcomplaint"], // Không được hủy khi đang hoàn trả
          finalcomplaint: [], // Hoàn thành, không thay đổi được
          final: [], // Đã hủy, không thay đổi được
        };

        const validNextStatuses = statusFlow[record.status] || [];
        const allStatuses = [
          { value: "pendingcomplaint", label: "Đang chờ" },
          { value: "acceptcomplaint", label: "Đã duyệt" },
          { value: "refundcomplaint", label: "Đang hoàn trả" },
          { value: "finalcomplaint", label: "Đã hoàn thành" },
          { value: "final", label: "Đã hủy" },
        ];
        return (
          <div className="">
            <Select
              value={record.status}
              onChange={async (value) => {
                try {
                  const response = await fetch(
                    `http://localhost:3100/api/update-complaint/${record._id}?status=${value}`
                  );
                  if (response.ok) {
                    notification["success"]({
                      message: "Thông báo",
                      description: `Cập nhật trạng thái thành công!`,
                    });
                    handelFetch(); // Cập nhật lại danh sách sau khi thay đổi
                  } else {
                    notification["error"]({
                      message: "Thông báo",
                      description: `Cập nhật trạng thái thất bại!`,
                    });
                  }
                } catch (error) {
                  notification["error"]({
                    message: "Thông báo",
                    description: `Đã xảy ra lỗi: ${error.message}`,
                  });
                }
              }}
              style={{ width: 160 }}
            >
              {allStatuses.map((status) => (
                <Select.Option
                  key={status.value}
                  value={status.value}
                  disabled={!validNextStatuses.includes(status.value)}
                >
                  {status.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        );
      },
    },
  ];
  const handelFetch = async () => {
    try {
      const response = await productApi.getComplaint(); // Gọi API lấy dữ liệu
      const sortedComplaints = response.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ); // Sắp xếp theo thời gian mới nhất
      setCategory(sortedComplaints); // Cập nhật dữ liệu sau khi sắp xếp
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch complaint list:", error);
    }
  };

  useEffect(() => {
    handelFetch();
  }, []);
  return (
    <div>
      <Spin spinning={loading}>
        <div className="container">
          <div style={{ marginTop: 30 }}>
            <Table
              columns={columns}
              pagination={{ position: ["bottomCenter"] }}
              dataSource={category}
            />
          </div>
        </div>

        <Modal
          title="Tạo danh mục mới"
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
          title="Chỉnh sửa danh mục"
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

export default Complaint;
