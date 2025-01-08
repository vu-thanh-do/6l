import { Button, Input } from "antd";
import React from "react";
import "./contact.css";

const { TextArea } = Input;

const Contact = () => {
  return (
    <div id="container" class="pt-5">
      <div
        id="carouselMultiItemExample"
        class="carousel slide carousel-dark text-center"
        data-mdb-ride="carousel"
      >
        <div class="carousel-inner py-4">
          <div class="carousel-item active">
            <div class="container">
              <div class="row">
                <div class="col-lg-4">
                  <img
                    class="rounded-circle shadow-1-strong mb-4 ml-20"
                    src="https://images.findagrave.com/photos/2024/285/196084392_2d692832-6744-4b81-a158-aa94edd5e032.jpeg"
                    alt="avatar"
                  />
                  <h5 class="mb-3">Fujiko Fujio</h5>
                  <p>Tác giả Doraemon</p>
                  <p class="text-muted">
                    <i class="fas fa-quote-left pe-2"></i>
                    Đằng sau thành công của một con người không thể thiếu một
                    cuốn sách gối đầu. Sách là kho báu tri thức của cả nhân
                    loại, là kết tinh trí tuệ qua bao thế hệ con người. Một cuốn
                    sách hay chính là chìa khóa quan trọng để mỗi con người có
                    thể chinh phục mọi khó khăn và chạm đến thành công
                  </p>
                  <ul class="list-unstyled d-flex justify-content-center text-warning mb-0">
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                  </ul>
                </div>

                <div class="col-lg-4 d-none d-lg-block">
                  <img
                    class="rounded-circle shadow-1-strong mb-4 ml-24"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq25Tz_2DQhrmDNLVITqOPB0xg-qExZ0N2sg&s"
                    alt="avatar"
                  />
                  <h5 class="mb-3">Huỳnh Như Phương </h5>
                  <p>Tác giả của Giấc Mơ, Cảnh Tượng Và Cái Nhìn</p>
                  <p class="text-muted">
                    <i class="fas fa-quote-left pe-2"></i>
                    Sách không chỉ là kho tàng kiến thức mà còn là phép màu kỳ
                    diệu với tâm hồn mỗi người. Đọc sách cũng là một phương pháp
                    thư giãn tinh thần và giải tỏa stress hiệu quả. Khi bạn đắm
                    chìm vào những câu từ xinh đẹp, mọi mệt mỏi dường như tan
                    biến.
                  </p>
                  <ul class="list-unstyled d-flex justify-content-center text-warning mb-0">
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star-half-alt fa-sm"></i>
                    </li>
                  </ul>
                </div>

                <div class="col-lg-4 d-none d-lg-block">
                  <img
                    class="rounded-circle shadow-1-strong mb-4 ml-24"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZWbOvFLCmbC4PcDH5rmWZMMYM-Xnv70KmKg&s"
                    alt="avatar"
                  />
                  <h5 class="mb-3">Aoyama Gōshō </h5>
                  <p>Tác giả của Thám tử lừng danh Conan</p>
                  <p class="text-muted">
                    <i class="fas fa-quote-left pe-2"></i>
                    Để ra đời một cuốn sách hay, tác giả phải chọn lọc và sử
                    dụng những câu từ chất lượng nhất, vừa có thể chạm đến người
                    đọc, vừa thể hiện được nghệ thuật của sáng tạo và viết lách.
                    Người đọc có thể tiếp cận được những ngôn từ hay và đẹp
                    nhất, sau đó tiếp thu chúng nhờ quá trình tư duy của não bộ.
                  </p>
                  <ul class="list-unstyled d-flex justify-content-center text-warning mb-0">
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="fas fa-star fa-sm"></i>
                    </li>
                    <li>
                      <i class="far fa-star fa-sm"></i>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container pb-5">
        <section class="text-center">
          <div class="row">
            <div class="col-lg-5">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863806019075!2d105.74468687471467!3d21.038134787457583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455e940879933%3A0xcf10b34e9f1a03df!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1sen!2s!4v1733412890028!5m2!1sen!2s"
                width="460"
                height="450"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div class="col-lg-7">
              <form className="p-4 rounded shadow-lg bg-light">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label">Họ tên</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div className="col-md-6 mb-4">
                    <label className="form-label">Địa chỉ email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>
                  <div className="col-md-12 mb-4">
                    <label className="form-label">Chủ đề</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập chủ đề"
                    />
                  </div>
                  <div className="col-md-12 mb-4">
                    <label className="form-label">Nội dung</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Nhập nội dung"
                    ></textarea>
                  </div>
                  <div className="col-md-12 text-center">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
