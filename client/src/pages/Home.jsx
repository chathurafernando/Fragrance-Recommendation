import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation(); // Get current URL path and query params
  const category = new URLSearchParams(location.search).get("cat"); // Get 'cat' param


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/posts${category ? `?cat=${category}` : ""}`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [category]);
  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent;
  };
  return (
    <div className="home">
      <div className="posts">
        {posts.map((post) => (
          <div className="post" key={post.id}>
            <div className="img">
              <img
                src={
                  post?.img && post.img.startsWith("http")
                    ? post.img
                    : `./uploads/${post.img}`  // Adjusted to point to the local uploads folder
                }
                alt="Post Image"
              />

            </div>
            <div className="content">
              <Link className="link" to={`/post/${post.id}`}>
                <h1>{post.title}</h1>
              </Link>
              <p>{getText(post.desc)}</p>

              <button>Read More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
