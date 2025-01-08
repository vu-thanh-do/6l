import React, { useState, useEffect } from "react";
import { Breadcrumb, Spin } from "antd";
import { Card, notification } from "antd";
import { useHistory } from "react-router-dom";
import productApi from "../../apis/productApi";
import { useParams } from "react-router-dom";

const NewsDetail = () => {
  const [news, setNews] = useState([]);
  let history = useHistory();
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      try {
        const response = await productApi.getNewDetail(id);
        console.log(response.data);
        setNews(response.data);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div>
      <Spin spinning={false}>
        <div className="container mx-auto p-4">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/home">
                  <span className="text-blue-500 hover:underline">
                    Trang chủ
                  </span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="http://localhost:3500/news">
                  <span className="text-blue-500 hover:underline">Tin tức</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <span>{news.name}</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr className="my-4" />
            <div className="pt-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {news.name}
              </h1>
              <div
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: news.description }}
              ></div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default NewsDetail;
