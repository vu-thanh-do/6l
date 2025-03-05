import BorrowCart from "../pages/Borrow/BorrowCart/borrowCart";
import BorrowConfirm from "../pages/Borrow/BorrowConfirm/borrowConfirm";
import MyLoans from "../pages/Borrow/MyLoans/myLoans";

const borrowRoutes = [
  {
    path: "/borrow-cart",
    component: BorrowCart,
    exact: true,
    requireAuth: true
  },
  {
    path: "/borrow-confirm",
    component: BorrowConfirm,
    exact: true,
    requireAuth: true
  },
  {
    path: "/my-loans",
    component: MyLoans,
    exact: true,
    requireAuth: true
  }
];

export default borrowRoutes; 