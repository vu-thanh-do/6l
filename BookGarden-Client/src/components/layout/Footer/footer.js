import React from "react";

function _Footer() {
  return (
    <section className="py-10 bg-gray-50 sm:pt-16 lg:pt-24">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:col-span-3 lg:grid-cols-6 gap-y-16 gap-x-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-2 lg:pr-8">
            <img className="w-[100px]" src="/logo.png" alt="Logo" />
            <p className="text-base leading-relaxed text-gray-600 mt-7">
              Chúng tôi cung cấp nhiều loại sách đa dạng để bạn lựa chọn. Hãy
              thăm cửa hàng của chúng tôi ngay hôm nay!
            </p>

            <ul className="flex items-center space-x-3 mt-9">
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600"
                >
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"></path>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600"
                >
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600"
                >
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z"></path>
                    <circle cx="16.806" cy="7.207" r="1.078"></circle>
                    <path d="M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217zm-1.218 9.532a5.043 5.043 0 0 1-.311 1.688 2.987 2.987 0 0 1-1.712 1.711 4.985 4.985 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a4.96 4.96 0 0 1-1.669-.311 2.985 2.985 0 0 1-1.719-1.711 5.08 5.08 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654 0-2.437 0-2.686.053-3.655a5.038 5.038 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5.01 5.01 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a4.96 4.96 0 0 1 1.67.311 2.991 2.991 0 0 1 1.712 1.712 5.08 5.08 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655 0 2.436 0 2.698-.043 3.654h-.011z"></path>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600"
                >
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.004 2C6.477 2 2 6.477 2 12.004s4.477 10.004 10.004 10.004 10.004-4.477 10.004-10.004S17.53 2 12.004 2zm0 18.201c-4.517 0-8.197-3.68-8.197-8.197S7.487 3.807 12.004 3.807 20.2 7.487 20.2 12.004s-3.68 8.197-8.197 8.197z"></path>
                    <path d="M16.367 10.837h-2.05v7.202h-2.744v-7.202H9.44V8.646h2.134V7.381c0-1.2.61-3.075 3.073-3.075h2.257v2.5h-1.641c-.267 0-.644.13-.644.702v1.138h2.289l-.54 2.191z"></path>
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Dịch vụ
            </h3>
            <ul className="mt-6 space-y-4">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Dịch vụ vận chuyển
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Điều khoản & Điều kiện
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Hỗ trợ
            </h3>
            <ul className="mt-6 space-y-4">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Hỗ trợ khách hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Liên hệ với chúng tôi
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Đăng ký nhận bản tin
            </h3>
            <form action="#" method="POST" className="mt-6">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative max-w-sm">
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="block w-full py-4 px-5 text-base text-gray-900 placeholder-gray-500 border border-gray-300 rounded-full focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Nhập địa chỉ email của bạn"
                />
                <button
                  type="submit"
                  className="absolute right-0 p-2 m-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                >
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500 leading-5">
                Đăng ký nhận tin tức mới nhất từ chúng tôi
              </p>
            </form>
          </div>
        </div>

        <hr className="mt-16 mb-10 border-gray-200" />

        <p className="text-sm text-gray-500">
          © 2024, Tất cả các quyền được bảo lưu
        </p>
      </div>
    </section>
  );
}

export default _Footer;
