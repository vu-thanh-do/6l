import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Menu, Header } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const HeaderComponent = () => {
  const [borrowItems, setBorrowItems] = useState([]);

  // Thêm menu mượn sách vào userMenu
  const userMenu = (
    <Menu>
      {/* ... existing menu items ... */}
      <Menu.Item key="my-loans" icon={<BookOutlined />}>
        <Link to="/my-loans">Sách đã mượn</Link>
      </Menu.Item>
    </Menu>
  );

  // Thêm icon giỏ mượn vào header
  return (
    <Header className="header">
      {/* ... existing code ... */}
      <div className="header-right">
        {/* ... existing code ... */}
        
        {/* Icon giỏ mượn */}
        <Link to="/borrow-cart" className="cart-icon">
          <Badge count={borrowItems.length} size="small">
            <BookOutlined style={{ fontSize: "24px", color: "#fff" }} />
          </Badge>
        </Link>

        {/* ... existing code ... */}
      </div>
    </Header>
  );
};

export default HeaderComponent; 