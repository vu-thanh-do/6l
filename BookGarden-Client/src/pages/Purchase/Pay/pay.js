import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../../../apis/axiosClient";
import { useParams } from "react-router-dom";
import productApi from "../../../apis/productApi";
import { useHistory } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Row, Tag, Spin, Card } from "antd";
import {
  Typography,
  Steps,
  Breadcrumb,
  Modal,
  notification,
  Form,
  Input,
  Select,
  Radio,
} from "antd";
import { LeftSquareOutlined } from "@ant-design/icons";
import axios from "axios";

const { Meta } = Card;
const { Option } = Select;

const { Title } = Typography;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { TextArea } = Input;

const Pay = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState([]);
  const [visible, setVisible] = useState(false);
  const [valueVouche, setValueVouche] = useState({
    value: 0,
  });

  const location = useLocation();
  const { selectedProducts } = location.state || {
    selectedProducts: [],
  }; // Lấy sản phẩm đã chọn từ state
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get("paymentId");
  const [orderTotalPrice, setTotalPrice] = useState(0); // Khai báo useState cho totalPrice
  const [form] = Form.useForm();
  const [template_feedback, setTemplateFeedback] = useState();
  let { id } = useParams();
  const [product, setProduct] = useState([]);
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const hideModal = () => {
    setVisible(false);
  };
  const [totalFee, setTotalFee] = useState(0);
  const [selectedProductss, setSelectedProducts] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        await productApi.getListVoucher().then((res) => {
          setProduct(res.data.docs);
        });
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
      }
    })();
  }, []);
  const saveFormAndProductData = () => {
    const formValues = form.getFieldsValue();

    // Lưu thông tin form
    if (formValues.name) {
      localStorage.setItem("payFormName", formValues.name);
    }

    if (formValues.email) {
      localStorage.setItem("payFormEmail", formValues.email);
    }

    if (formValues.phone) {
      localStorage.setItem("payFormPhone", formValues.phone);
    }

    if (formValues.address5) {
      localStorage.setItem("payFormProvince", formValues.address5);
    }

    if (formValues.address2) {
      localStorage.setItem("payFormDistrict", formValues.address2);
    }

    if (formValues.address3) {
      localStorage.setItem("payFormWard", formValues.address3);
    }

    if (formValues.address) {
      localStorage.setItem("payFormDetailAddress", formValues.address);
    }

    if (formValues.description) {
      localStorage.setItem("payFormDescription", formValues.description);
    }

    if (formValues.billing) {
      localStorage.setItem("payFormBillingMethod", formValues.billing);
    }

    // Lưu thông tin sản phẩm
    if (selectedProducts && selectedProducts.length > 0) {
      localStorage.setItem(
        "paySelectedProducts",
        JSON.stringify(selectedProducts)
      );
    }

    // Lưu tổng tiền
    if (orderTotalPrice) {
      localStorage.setItem("payOrderTotalPrice", orderTotalPrice.toString());
    }

    // Lưu phí ship
    if (totalFee) {
      localStorage.setItem("payShippingFee", totalFee.toString());
    }
  };
  // Thêm useEffect để tự động lưu dữ liệu
  useEffect(() => {
    const handleFormDataChange = () => {
      saveFormAndProductData();
    };

    // Đăng ký sự kiện thay đổi form
    const unregister = form
      .getInternalHooks("RC_FORM_INTERNAL_HOOKS")
      .registerWatch(handleFormDataChange);

    // Cleanup function
    return () => {
      unregister();
    };
  }, [form, selectedProducts, orderTotalPrice, totalFee]);
  // Hàm khôi phục dữ liệu
  const restoreFormAndProductData = () => {
    // Khôi phục thông tin form
    const savedFormData = {
      name: localStorage.getItem("payFormName") || undefined,
      email: localStorage.getItem("payFormEmail") || undefined,
      phone: localStorage.getItem("payFormPhone") || undefined,
      address5: localStorage.getItem("payFormProvince")
        ? parseInt(localStorage.getItem("payFormProvince"))
        : undefined,
      address2: localStorage.getItem("payFormDistrict")
        ? parseInt(localStorage.getItem("payFormDistrict"))
        : undefined,
      address3: localStorage.getItem("payFormWard") || undefined,
      address: localStorage.getItem("payFormDetailAddress") || undefined,
      description: localStorage.getItem("payFormDescription") || undefined,
      billing: localStorage.getItem("payFormBillingMethod") || undefined,
    };
    // Đặt lại các giá trị cho form
    form.setFieldsValue(savedFormData);

    // Khôi phục sản phẩm đã chọn
    const savedSelectedProducts = localStorage.getItem("paySelectedProducts");
    if (savedSelectedProducts) {
      const parsedProducts = JSON.parse(savedSelectedProducts);
      setSelectedProducts(parsedProducts);
    }
    // Khôi phục tổng tiền
    const savedTotalPrice = localStorage.getItem("payOrderTotalPrice");
    if (savedTotalPrice) {
      setTotalPrice(parseFloat(savedTotalPrice));
    }

    // Khôi phục phí ship
    const savedShippingFee = localStorage.getItem("payShippingFee");
    if (savedShippingFee) {
      setTotalFee(parseFloat(savedShippingFee));
    }

    // Nếu có tỉnh đã lưu, tải huyện
    if (savedFormData.address5) {
      fetchHuyen(savedFormData.address5);
    }

    // Nếu có huyện đã lưu, tải xã
    if (savedFormData.address2) {
      fetchXa(savedFormData.address2);
    }
  };
  // Thêm useEffect để khôi phục dữ liệu từ localStorage khi component mount
  useEffect(() => {
    restoreFormAndProductData();
  }, [form]);
  const currentDate = new Date();
  // Thêm hàm xóa dữ liệu localStorage khi đơn hàng hoàn tất
  const clearPayFormLocalStorage = () => {
    // Xóa thông tin form
    const formStorageKeys = [
      "payFormName",
      "payFormEmail",
      "payFormPhone",
      "payFormProvince",
      "payFormDistrict",
      "payFormWard",
      "payFormDetailAddress",
      "payFormDescription",
      "payFormBillingMethod",
    ];

    // Xóa thông tin sản phẩm và thanh toán
    const productStorageKeys = [
      "paySelectedProducts",
      "payOrderTotalPrice",
      "payShippingFee",
    ];

    [...formStorageKeys, ...productStorageKeys].forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  console.log("Selected Products:", selectedProducts);
  const orderTotalPriceRef = useRef(orderTotalPrice);
  useEffect(() => {
    orderTotalPriceRef.current = orderTotalPrice; // Cập nhật giá trị trong useRef
  }, [orderTotalPrice]);
  useEffect(() => {
    if (selectedProducts && selectedProducts.length > 0) {
      const total = selectedProducts.reduce((acc, item) => {
        return acc + (item.salePrice * item.stock || 0);
      }, 0);

      // Lưu vào localStorage ngay khi tính toán
      localStorage.setItem("selected_products_total", total.toString());

      setTotalPrice(total);
      console.log("Updated orderTotalPrice:", total);
    } else {
      setTotalPrice(0);
      localStorage.removeItem("selected_products_total");
    }
  }, [selectedProducts]);
  const accountCreate = async (values) => {
    setLoading(true); // Bắt đầu loading khi gửi form

    // Tính toán tổng tiền (bao gồm phí ship)
    const totalAmount =
      valueVouche == "freeShip" ? orderTotalPrice + totalFee : orderTotalPrice;
    const orderData = {
      userId: userData._id,
      address: values.address,
      billing: values.billing,
      description: values.description,
      status: "pending",
      products: productDetail,
      orderTotal: totalAmount, // Tổng tiền đã tính
    };
    if (values.billing === "vnpay") {
      try {
        // Lưu thông tin đơn hàng vào localStorage
        localStorage.setItem(
          "vnpay_order_info",
          JSON.stringify({
            userId: userData._id,
            address: values.address,
            billing: values.billing,
            description: values.description,
            status: "pending",
            products: selectedProducts,
            orderTotal: totalAmount,
          })
        );

        // Lưu thông tin địa chỉ và mô tả
        localStorage.setItem("vnpay_description", values.description);
        localStorage.setItem("vnpay_address", values.address);

        // Dữ liệu thanh toán VNPAY
        const vnpayData = {
          amount: totalAmount,
          orderDescription: values.description || "Thanh toán đơn hàng",
          orderType: "billpayment",
          language: "vn",
          returnUrl: "http://localhost:3500/pay",
        };

        // Gọi API tạo URL thanh toán VNPAY
        const response = await axiosClient.post(
          "/vnpay/create-payment-url",
          vnpayData
        );

        if (response.paymentUrl) {
          // Chuyển hướng đến trang thanh toán VNPAY
          window.location.href = response.paymentUrl;
        } else {
          notification["error"]({
            message: `Thông báo`,
            description: "Không thể tạo đường dẫn thanh toán VNPAY",
          });
        }
      } catch (error) {
        console.error("VNPAY Payment Error:", error);
        notification["error"]({
          message: `Thông báo`,
          description: "Lỗi trong quá trình tạo thanh toán VNPAY",
        });
      }
      return;
    }

    // Giữ nguyên logic cho PayPal
    else if (values.billing === "paypal") {
      localStorage.setItem("description", values.description);
      localStorage.setItem("address", values.address);
      const approvalUrl = await handlePayment(values, orderData); // Truyền orderData vào hàm handlePayment
      if (approvalUrl) {
        window.location.href = approvalUrl; // Chuyển hướng đến URL thanh toán PayPal
      } else {
        notification["error"]({
          message: `Thông báo`,
          description: "Thanh toán thất bại",
        });
      }
    } else {
      // Giữ nguyên logic cho COD
      try {
        await axiosClient.post("/order", orderData).then((response) => {
          console.log(response);

          if (response == undefined) {
            notification["error"]({
              message: `Thông báo`,
              description: "Đặt hàng thất bại",
            });
          } else {
            notification["success"]({
              message: `Thông báo`,
              description: "Đặt hàng thành công",
            });
            // Xóa dữ liệu form khỏi localStorage
            clearPayFormLocalStorage();

            // Xóa sản phẩm đã chọn khỏi giỏ hàng
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            console.log("Current Cart:", cart); // Kiểm tra giỏ hàng hiện tại
            console.log("Selected Products:", selectedProducts); // Kiểm tra sản phẩm đã chọn

            // Lọc giỏ hàng để chỉ giữ lại sản phẩm không nằm trong selectedProducts
            const updatedCart = cart.filter(
              (item) =>
                !selectedProducts.some((selected) => selected._id === item._id)
            );

            console.log("Updated Cart:", updatedCart); // Kiểm tra giỏ hàng đã cập nhật

            localStorage.setItem("cart", JSON.stringify(updatedCart)); // Cập nhật giỏ hàng

            form.resetFields();
            history.push("/final-pay");
            localStorage.removeItem("cartLength");
          }
        });
      } catch (error) {
        throw error;
      }
      setTimeout(function () {
        setLoading(false);
      }, 1000);
    }
  };
  const handlePayment = async (values) => {
    try {
      // Kiểm tra và tính toán phí vận chuyển
      const fetchShippingFee = async () => {
        try {
          // Lấy thông tin địa chỉ từ form
          const province = form.getFieldValue("address5");
          const district = form.getFieldValue("address2");
          const ward = form.getFieldValue("address3");

          // Kiểm tra đủ thông tin để tính phí
          if (province && district && ward) {
            const dataPayload = {
              service_type_id: 2,
              from_district_id: 1542,
              from_ward_code: "21211",
              to_district_id: district,
              to_ward_code: ward,
              height: 1,
              length: 1,
              weight: 1,
              width: 1,
              insurance_value: 0,
              coupon: null,
              items: [
                {
                  name: "TEST1",
                  stock: 1,
                  height: 1,
                  weight: 1,
                  length: 1,
                  width: 1,
                },
              ],
            };

            const response = await axios.post(
              "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
              dataPayload,
              {
                headers: {
                  token: "33224be7-ab31-11ef-a89d-dab02cbaab48",
                  shop_id: "5479564",
                },
              }
            );

            return response?.data?.data?.total || 0;
          }
          return 0;
        } catch (error) {
          console.error("Error fetching shipping fee:", error);
          return 0;
        }
      };

      // Tính phí vận chuyển
      const shippingFee = await fetchShippingFee();

      // Tính tổng tiền (bao gồm phí ship)
      // const totalAmount = Number(orderTotalPrice) + Number(shippingFee);
      const totalAmount =
        valueVouche == "freeShip"
          ? Number(orderTotalPrice) + Number(shippingFee)
          : Number(orderTotalPrice);

      if (values.billing === "paypal") {
        // Lưu thông tin vào localStorage
        localStorage.setItem("paypal_shipping_fee", shippingFee.toString());
        localStorage.setItem("paypal_total_amount", totalAmount.toString());
        localStorage.setItem("description", values.description);
        localStorage.setItem("address", values.address);

        // Chuyển đổi sang USD
        const totalAmountInUSD = (totalAmount / 25000).toFixed(2);

        const productPayment = {
          price: totalAmountInUSD.toString(),
          description: values.description,
          return_url: "http://localhost:3500" + location.pathname,
          cancel_url: "http://localhost:3500" + location.pathname,
        };

        const response = await axiosClient.post("/payment/pay", productPayment);

        if (response.approvalUrl) {
          localStorage.setItem("session_paypal", response.accessToken);
          return response.approvalUrl;
        } else {
          notification["error"]({
            message: `Thông báo`,
            description: "Thanh toán thất bại",
          });
          return null;
        }
      }
    } catch (error) {
      console.error("Payment Error:", error);
      notification["error"]({
        message: `Thông báo`,
        description: "Có lỗi xảy ra trong quá trình thanh toán",
      });
      throw error;
    }
  };
  const cartLength = localStorage.getItem("cartLength");
  const handleModalConfirm = async () => {
    setLoading(true);
    try {
      // Lấy giá trị từ localStorage
      const storedTotalPrice = localStorage.getItem("paypal_total_amount");
      const storedShippingFee = localStorage.getItem("paypal_shipping_fee");

      console.log("Stored Total Price:", storedTotalPrice);
      console.log("Stored Shipping Fee:", storedShippingFee);

      // Kiểm tra giá trị
      if (!storedTotalPrice || Number(storedTotalPrice) <= 0) {
        notification["error"]({
          message: `Thông báo`,
          description: "Không thể xác định tổng tiền. Vui lòng thử lại.",
        });
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams(window.location.search);
      const paymentId = queryParams.get("paymentId");
      const PayerID = queryParams.get("PayerID");
      const token = localStorage.getItem("session_paypal");
      const description = localStorage.getItem("description");
      const address = localStorage.getItem("address");

      // Gọi API executePayment để thực hiện thanh toán
      const response = await axiosClient.get("/payment/executePayment", {
        params: {
          paymentId,
          token,
          PayerID,
        },
      });

      if (response) {
        const local = localStorage.getItem("user");
        const currentUser = JSON.parse(local);

        // Lấy giỏ hàng hiện tại
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const selectedProductIds =
          JSON.parse(localStorage.getItem("selectedProducts")) || [];

        // Lọc bỏ các sản phẩm đã thanh toán khỏi giỏ hàng
        const updatedCart = cart.filter(
          (item) => !selectedProductIds.includes(item._id)
        );

        // Lưu giỏ hàng đã cập nhật
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        localStorage.removeItem("selectedProducts");

        const formatData = {
          userId: currentUser._id,
          address: address,
          billing: "paypal",
          description: description,
          status: "pending",
          products: productDetail,
          orderTotal: Number(storedTotalPrice),
          shippingFee: Number(storedShippingFee),
          paymentId: paymentId,
          payerId: PayerID,
        };

        console.log("formatData trước khi gửi:", formatData);

        // Gửi yêu cầu lưu đơn hàng vào CSDL
        const orderResponse = await axiosClient.post("/order", formatData);

        if (orderResponse) {
          notification["success"]({
            message: `Thông báo`,
            description: "Đặt hàng thành công",
          });

          // Xóa các giá trị localStorage không cần thiết
          localStorage.removeItem("paypal_total_amount");
          localStorage.removeItem("paypal_shipping_fee");
          localStorage.removeItem("description");
          localStorage.removeItem("address");
          localStorage.removeItem("cartLength");

          form.resetFields();
          history.push("/final-pay");
        } else {
          notification["error"]({
            message: `Thông báo`,
            description: "Đặt hàng thất bại",
          });
        }
      } else {
        notification["error"]({
          message: `Thông báo`,
          description: "Thanh toán thất bại",
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error executing payment:", error);
      notification["error"]({
        message: `Thông báo`,
        description: "Có l ỗi xảy ra trong quá trình thanh toán.",
      });
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };
  const CancelPay = () => {
    form.resetFields();
    history.push("/cart");
  };
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.salePrice * item.stock,
    0
  );

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);

        // Lấy danh sách sản phẩm đã chọn từ localStorage
        const selectedProductIds =
          JSON.parse(localStorage.getItem("selectedProducts")) || [];
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const local = localStorage.getItem("user");
        const user = local ? JSON.parse(local) : null;

        // Lọc và chuyển đổi sản phẩm được chọn
        const transformedData = cart
          .filter((item) => selectedProductIds.includes(item._id))
          .map(({ _id: product, stock, salePrice }) => ({
            product,
            stock,
            salePrice,
          }));

        // Tính tổng tiền cho các sản phẩm đã chọn
        const totalPrice = transformedData.reduce((acc, item) => {
          return acc + item.salePrice * item.stock;
        }, 0);

        // Cập nhật state
        setOrderTotal(totalPrice);
        setTotalPrice(totalPrice);
        setProductDetail(transformedData);
        setUserData(user);

        // Điền thông tin người dùng vào form
        if (user) {
          form.setFieldsValue({
            name: user.username,
            email: user.email,
            phone: user.phone,
          });
        }

        // Kiểm tra và xử lý thanh toán PayPal
        if (paymentId) {
          console.log("Payment ID detected");
          console.log("Total Price:", totalPrice);

          // Lưu giá trị vào localStorage để sử dụng sau này
          localStorage.setItem("paypal_total_price", totalPrice.toString());

          if (totalPrice > 0) {
            setShowModal(true);
          } else {
            notification["error"]({
              message: `Thông báo`,
              description:
                "Tổng tiền không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.",
            });
          }
        }

        // Lấy chi tiết sản phẩm (nếu có ID sản phẩm)
        if (id) {
          try {
            const productDetailResponse = await productApi.getDetailProduct(id);
            setProductDetail(productDetailResponse);
          } catch (productError) {
            console.error("Failed to fetch product details:", productError);
          }
        }

        // Đặt trạng thái loading
        setLoading(false);

        // Cuộn trang lên đầu
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Failed to fetch payment details:", error);

        // Hiển thị thông báo lỗi
        notification["error"]({
          message: `Thông báo`,
          description: "Đã có lỗi xảy ra khi tải thông tin thanh toán.",
        });

        // Kết thúc trạng thái loading
        setLoading(false);
      }
    };

    // Gọi hàm fetch
    fetchPaymentDetails();

    // Dependency array để theo dõi các thay đổi
  }, [paymentId, id, form]);

  // Thêm useEffect để theo dõi selectedProducts
  useEffect(() => {
    const selectedProductIds =
      JSON.parse(localStorage.getItem("selectedProducts")) || [];
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const transformedData = cart
      .filter((item) => selectedProductIds.includes(item._id))
      .map(({ _id: product, stock, salePrice }) => ({
        product,
        stock,
        salePrice,
      }));

    const totalPrice = transformedData.reduce((acc, item) => {
      return acc + item.salePrice * item.stock;
    }, 0);

    // Cập nhật state và localStorage
    setOrderTotal(totalPrice);
    setTotalPrice(totalPrice);
    localStorage.setItem("paypal_total_price", totalPrice.toString());

    console.log("Updated Total Price:", totalPrice);
  }, []); // Dependency array rỗng để chạy một lần duy nhất
  const [tinh, setTinh] = useState([]); // Danh sách tỉnh
  const [huyen, setHuyen] = useState([]); // Danh sách huyện
  const [xa, setXa] = useState([]); // Danh sách xã
  const [idXa, setIdXa] = useState(null);
  const [idHuyen2, setIdHuyen] = useState(null);

  const fetchTinh = async () => {
    try {
      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {
          headers: {
            token: "11acfacb-a8a1-11ef-a094-f28ffa88cdab",
          },
        }
      );
      console.log(response, "response");
      setTinh(response.data.data);
    } catch (error) {
      console.error("Lỗi khi tải tỉnh:", error);
    }
  };
  const onGetPrice = async (idx) => {
    // setIdXa(idx);
    await fetchPrice(idx);
  };
  const fetchHuyen = async (idTinh) => {
    try {
      setLoading(true);

      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        {
          params: {
            province_id: idTinh,
          },
          headers: {
            token: "11acfacb-a8a1-11ef-a094-f28ffa88cdab",
          },
        }
      );
      setHuyen(response.data.data);
      setXa([]); // Reset xã khi chọn tỉnh mới
    } finally {
      setLoading(false);
    }
  };

  const fetchXa = async (idHuyen) => {
    try {
      setLoading(true);
      setIdHuyen(idHuyen);

      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        {
          params: {
            district_id: idHuyen,
          },
          headers: {
            token: "11acfacb-a8a1-11ef-a094-f28ffa88cdab",
          },
        }
      );
      setXa(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrice = async (cc) => {
    try {
      setLoading(true);
      const dataPayload = {
        service_type_id: 2,
        from_district_id: 1542,
        from_ward_code: "21211",
        to_district_id: idHuyen2,
        to_ward_code: cc,
        height: 1,
        length: 1,
        weight: 1,
        width: 1,
        insurance_value: 0,
        coupon: null,
        items: [
          {
            name: "TEST1",
            stock: 1,
            height: 1,
            weight: 1,
            length: 1,
            width: 1,
          },
        ],
      };
      const response = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        dataPayload,
        {
          headers: {
            token: "33224be7-ab31-11ef-a89d-dab02cbaab48",
            shop_id: "5479564",
          },
        }
      );
      console.log(response?.data?.data?.total, "responseresponseresponse");
      setTotalFee(response?.data?.data?.total);
      // setXa(response.data.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTinh();
  }, []);
  const [selected, setSelected] = useState("null");
  return (
    <div class="py-5">
      <Spin spinning={loading}>
        <Card className="container">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/cart">
                  <LeftSquareOutlined style={{ fontSize: "24px" }} />
                  <span> Quay lại giỏ hàng</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>Thanh toán</span>
                </Breadcrumb.Item>
              </Breadcrumb>

              <div className="payment_progress">
                <Steps
                  current={1}
                  percent={60}
                  items={[
                    {
                      title: "Chọn sản phẩm",
                    },
                    {
                      title: "Thanh toán",
                    },
                    {
                      title: "Hoàn thành",
                    },
                  ]}
                />
              </div>

              <div className="information_pay">
                <Form
                  form={form}
                  onFinish={accountCreate}
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
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input placeholder="Tên" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input disabled placeholder="Email" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>

                  <Form.Item
                    name="address5"
                    label="Tỉnh/Thành"
                    hasFeedback
                    rules={[
                      { required: true, message: "Vui lòng chọn tỉnh/thành!" },
                    ]}
                    style={{ marginBottom: 15 }}
                  >
                    <Select
                      placeholder="Chọn Tỉnh/Thành"
                      className="w-full"
                      allowClear
                      onChange={(e) => fetchHuyen(e)}
                    >
                      {tinh.map((item) => (
                        <Option key={item.ProvinceID} value={item.ProvinceID}>
                          {item.ProvinceName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="address2"
                    label="Quận/Huyện"
                    hasFeedback
                    rules={[
                      { required: true, message: "Vui lòng chọn quận/huyện!" },
                      () => ({
                        validator(_, value) {
                          if (!value && huyen.length === 0) {
                            return Promise.reject(
                              new Error("Vui lòng chọn tỉnh/thành trước!")
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                    style={{ marginBottom: 15 }}
                  >
                    <Select
                      placeholder="Chọn Quận/Huyện"
                      className="w-full"
                      allowClear
                      onChange={(e) => fetchXa(e)}
                      disabled={!huyen.length}
                    >
                      {huyen.map((item) => (
                        <Option key={item.DistrictID} value={item.DistrictID}>
                          {item.DistrictName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="address3"
                    label="Xã/Phường"
                    hasFeedback
                    rules={[
                      { required: true, message: "Vui lòng chọn xã/phường!" },
                      () => ({
                        validator(_, value) {
                          if (!value && xa.length === 0) {
                            return Promise.reject(
                              new Error("Vui lòng chọn quận/huyện trước!")
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                    style={{ marginBottom: 15 }}
                  >
                    <Select
                      placeholder="Chọn Xã/Phường"
                      className="w-full"
                      allowClear
                      onChange={(e) => onGetPrice(e)}
                      disabled={!xa.length}
                    >
                      {xa.map((item) => (
                        <Option key={item.WardCode} value={item.WardCode}>
                          {item.WardName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <p>Phí ship</p>
                  <p className="font-bold text-black text-xl">
                    {valueVouche?.value == "freeShip" ? (
                      <span
                        style={{
                          textDecoration: "line-through",
                        }}
                      >
                        {" "}
                        {totalFee?.toLocaleString()} VND
                      </span>
                    ) : (
                      totalFee?.toLocaleString() + "VND"
                    )}
                  </p>
                  <p>Tổng tiền (bao gồm phí ship)</p>
                  <p className="font-bold text-black text-xl">
                    {valueVouche?.value == "freeShip"
                      ? orderTotalPrice?.toLocaleString()
                      : (
                          orderTotalPrice +
                          totalFee -
                          valueVouche?.value
                        )?.toLocaleString()}{" "}
                    VND
                  </p>
                  <Form.Item
                    name="type"
                    label="Loại voucher"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn Loại voucher!",
                      },
                    ]}
                    style={{ marginBottom: 10 }}
                  >
                    <Select
                      onChange={(value) => {
                        console.log(value, "opkoko");
                        setValueVouche({
                          value: typeof value == "number" ? value : "freeShip",
                        });
                      }}
                      style={{ width: "100%" }}
                      placeholder="Loại voucher"
                    >
                      {product
                        ?.filter((iac) => iac.status == "active")
                        ?.map((itc, index) => {
                          const endDate = new Date(itc.endDate);
                          console.log(endDate, "endDate");
                          console.log(currentDate, "currentDate");
                          return (
                            <Option
                              disabled={
                                // currentDate
                                // itc.type == "freeShip" && Number(cartLength) < 2
                                Number(orderTotalPrice) < Number(itc.require)
                              }
                              key={itc._id}
                              value={itc.value}
                            >
                              {itc?.name}{" "}
                              <span
                                style={{
                                  fontWeight: "bold",
                                  paddingLeft: "10px",
                                }}
                              >
                                Điều kiện sử dụng đơn hàng lớn hơn{" "}
                                {Number(itc.require)?.toLocaleString()}
                              </span>
                            </Option>
                          );
                        })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="address"
                    label="Nhập chi tiết số nhà, ngách ngõ"
                    hasFeedback
                    style={{ marginBottom: 15 }}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập chi tiết địa chỉ!",
                      },
                      {
                        min: 5,
                        message: "Địa chỉ phải có ít nhất 5 ký tự!",
                      },
                    ]}
                  >
                    <Input placeholder="Chi tiết Địa chỉ" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Lưu ý cho đơn hàng"
                    hasFeedback
                    style={{ marginBottom: 15 }}
                  >
                    <Input.TextArea rows={4} placeholder="Lưu ý" />
                  </Form.Item>

                  <Form.Item
                    name="billing"
                    label="Phương thức thanh toán"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phương thức thanh toán!",
                      },
                    ]}
                    style={{ marginBottom: 10 }}
                  >
                    <div className="flex space-x-4">
                      {/* COD */}
                      <label
                        className={`text-gray-900 bg-[#37df37] hover:bg-[#37df37]/90 focus:ring-4 focus:outline-none focus:ring-[#37df37]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#37df37]/50 me-2 mb-2 ${
                          selected === "cod"
                            ? "font-bold border-2 border-[#37df37] bg-[#37df37]/10 text-[#37df37]"
                            : "border border-gray-300"
                        }`}
                        onClick={() => setSelected("cod")} // Thêm onClick để thay đổi trạng thái
                      >
                        <img
                          src="givemoney.png"
                          alt="COD"
                          className="w-6 h-6"
                        />
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          className="hidden"
                          onChange={() => setSelected("cod")}
                        />
                        <span className="ml-2 text-gray-700">
                          Thanh toán khi nhận hàng
                        </span>
                      </label>

                      {/* PAYPAL */}
                      <label
                        className={`text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-4 focus:outline-none focus:ring-[#F7BE38]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#F7BE38]/50 me-2 mb-2 ${
                          selected === "paypal"
                            ? "font-bold border-2 border-[#F7BE38] bg-[#F7BE38]/10 text-[#F7BE38]"
                            : "border border-gray-300"
                        }`}
                        onClick={() => setSelected("paypal")} // Thêm onClick để thay đổi trạng thái
                      >
                        <svg
                          className="w-4 h-4 text-blue-500 me-2"
                          aria-hidden="true"
                          focusable="false"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                        >
                          <path
                            fill="currentColor"
                            d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.3c-7.6 0-13.1-6.6-12.1-13.9L58.8 46.6c1.5-9.6 10.1-16.9 20-16.9 152.3 0 165.1-3.7 204 11.4 60.1 23.3 65.6 79.5 44 140.3-21.5 62.6-72.5 89.5-140.1 90.3-43.4 .7-69.5-7-75.3 24.2zM357.1 152c-1.8-1.3-2.5-1.8-3 1.3-2 11.4-5.1 22.5-8.8 33.6-39.9 113.8-150.5 103.9-204.5 103.9-6.1 0-10.1 3.3-10.9 9.4-22.6 140.4-27.1 169.7-27.1 169.7-1 7.1 3.5 12.9 10.6 12.9h63.5c8.6 0 15.7-6.3 17.4-14.9 .7-5.4-1.1 6.1 14.4-91.3 4.6-22 14.3-19.7 29.3-19.7 71 0 126.4-28.8 142.9-112.3 6.5-34.8 4.6-71.4-23.8-92.6z"
                          ></path>
                        </svg>
                        <input
                          type="radio"
                          name="payment"
                          value="paypal"
                          className="hidden"
                          onChange={() => setSelected("paypal")}
                        />
                        <span className="ml-2 text-gray-700">
                          Thanh toán bằng PAYPAL
                        </span>
                      </label>
                    </div>
                  </Form.Item>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      className="border border-gray-300 text-gray-900 py-2 px-4 rounded hover:bg-gray-100"
                      onClick={CancelPay}
                    >
                      Trở về
                    </button>

                    <button
                      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
                      htmlType="submit"
                      loading={loading}
                    >
                      {loading ? "Đang xử lý..." : "Hoàn thành"}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </Card>
        <Modal
          visible={showModal}
          onOk={handleModalConfirm}
          onCancel={() => setShowModal(false)}
        >
          <p>Bạn có chắc chắn muốn xác nhận thanh toán ?</p>
        </Modal>
      </Spin>
    </div>
  );
};

export default Pay;
