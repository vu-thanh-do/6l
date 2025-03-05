import React, { useEffect, useState } from "react";
import styles from "./header.module.css";
import DropdownAvatar from "../../DropdownMenu/dropdownMenu";
import { useHistory, NavLink } from "react-router-dom";
import {
  Layout,
  Avatar,
  Badge,
  Row,
  Col,
  List,
  Popover,
  Modal,
  Drawer,
  Select,
  Space,
  Button,
  Menu,
} from "antd";
import {
  BellOutlined,
  NotificationTwoTone,
  BarsOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import axiosClient from "../../../apis/axiosClient";

const { Option } = Select;
const { Header } = Layout;

function Topbar() {
  const [countNotification, setCountNotification] = useState(0);
  const [notification, setNotification] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visiblePopover, setVisiblePopover] = useState(false);
  const [titleNotification, setTitleNotification] = useState("");
  const [contentNotification, setContentNotification] = useState("");
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [userData, setUserData] = useState([]);
  const [cart, setCart] = useState(0);
  const [borrowCart, setBorrowCart] = useState(0);

  const history = useHistory();

  const handleLink = (link) => {
    setVisibleDrawer(false);
    history.push(link);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const showDrawer = () => {
    setVisibleDrawer(true);
  };

  const onClose = () => {
    setVisibleDrawer(false);
  };

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectOptions, setSelectOptions] = useState([]);

  const handleSelectChange = async (value) => {
    setSelectedOption(value);
    console.log(value);
    history.push("/product-detail/" + value);
    window.location.reload();
  };

  const updateSelectOptions = (newOptions) => {
    const updatedOptions = newOptions.map((option) => ({
      value: option._id,
      label: option.name,
    }));

    setSelectOptions(updatedOptions);
  };

  const handleSearch = async (value) => {
    try {
      const response = await axiosClient.get(
        `/product/searchByName?name=${value}`
      );
      const data = response.data;

      updateSelectOptions(data.docs);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const local = localStorage.getItem("user");
        const user = JSON.parse(local);
        setUserData(user);

        // Lấy số lượng giỏ hàng
        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(cartItems.length);

        // Lấy số lượng giỏ mượn
        const borrowItems = JSON.parse(localStorage.getItem("borrowItems")) || [];
        setBorrowCart(borrowItems.length);
      } catch (error) {
        console.log("Failed to fetch profile user:" + error);
      }
    })();
  }, []);

  // Menu cho mobile
  const mobileMenu = (
    <Menu>
      <Menu.Item key="home" onClick={() => handleLink("/home")}>
        Trang chủ
      </Menu.Item>
      <Menu.Item key="products" onClick={() => handleLink("/product-list")}>
        Sản phẩm
      </Menu.Item>
      <Menu.Item key="news" onClick={() => handleLink("/news")}>
        Tin tức
      </Menu.Item>
      <Menu.Item key="contact" onClick={() => handleLink("/contact")}>
        Liên hệ
      </Menu.Item>
      <Menu.Item key="cart" onClick={() => handleLink("/cart")}>
        Giỏ hàng ({cart})
      </Menu.Item>
      <Menu.Item key="borrow" onClick={() => handleLink("/borrow-cart")}>
        Giỏ mượn ({borrowCart})
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className={styles.header}>
      {/* Logo */}
      <div className={styles.logo}>
        <img
          src="/logo.png"
          alt="Logo"
          onClick={() => handleLink("/home")}
          style={{ width: 100, cursor: "pointer" }}
        />
      </div>

      {/* Menu cho mobile */}
      <div className={styles.mobileMenu}>
        <Button type="text" icon={<BarsOutlined />} onClick={() => setVisibleDrawer(true)} />
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setVisibleDrawer(false)}
          visible={visibleDrawer}
        >
          {mobileMenu}
        </Drawer>
      </div>

      {/* Menu chính */}
      <nav className={styles.navMenu}>
        <NavLink className={styles.navLink} to="/home">
          Trang chủ
        </NavLink>
        <NavLink className={styles.navLink} to="/product-list">
          Sản phẩm
        </NavLink>
        <NavLink className={styles.navLink} to="/news">
          Tin tức
        </NavLink>
        <NavLink className={styles.navLink} to="/contact">
          Liên hệ
        </NavLink>
      </nav>

      {/* Thanh tìm kiếm */}
      <div className={styles.searchBar}>
        <Select
          showSearch
          placeholder="Bạn tìm gì..."
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label?.toLowerCase() ?? "").includes(input.toLowerCase())
          }
          onChange={handleSelectChange}
          onSearch={handleSearch}
          options={selectOptions}
          className={styles.searchSelect}
        />
      </div>

      {/* Các nút bên phải */}
      <div className={styles.rightButtons}>
        {/* Giỏ hàng */}
        <Badge count={cart} className={styles.cartBadge}>
          <Button
            type="text"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleLink("/cart")}
            className={styles.cartButton}
          >
            <span className={styles.buttonText}>Giỏ hàng</span>
          </Button>
        </Badge>

        {/* Giỏ mượn */}
        <Badge count={borrowCart} className={styles.borrowBadge}>
          <Button
            type="text"
            icon={<BookOutlined />}
            onClick={() => handleLink("/borrow-cart")}
            className={styles.borrowButton}
          >
            <span className={styles.buttonText}>Giỏ mượn</span>
          </Button>
        </Badge>

        {/* Avatar và điểm */}
        <Space className={styles.userInfo}>
          <Badge count={userData?.score > 0 ? userData?.score : 0} />
          <DropdownAvatar />
        </Space>
      </div>
    </Header>
  );
}

export default Topbar;
