// import axios from 'axios';
// import Edit from "../img/edit.png"
// import Delete from "../img/delete.png";
// import React, { useContext, useEffect, useState } from 'react'
// import { Link,useLocation } from 'react-router-dom'
// import moment from 'moment'
// import { AuthContext } from '../context/authContext';

// const Single = () => {

//   const [post, setPosts] = useState([]);
//   const location = useLocation(); // Get current URL path and query params
// const postId = location.pathname.split("/")[2]
// const {currentUser} = useContext(AuthContext)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get(`/post/${postId}`);
//         setPosts(res.data);
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     fetchData();
//   }, [postId]);

//   return (
//     <div className="single">
//       <div className="content">
//       <img src={post?.img?.startsWith("http") ? post.img : `../upload/${post?.img}`} alt="pakaya" />
//       <div className="user">
//       {post.userImg && <img src={post.userImg.startsWith("http") ? post.userImg : `../upload/${post.userImg}`} alt="" />}

//           <div className="info">
//             <span>{post.username}</span>
//             <p>Posted {moment(post.date).fromNow()}</p>
//           </div>
//          {currentUser.username =  post.username &&(
//           <div className="edit">
//             <Link to= {`/write?edit=2`}state={post}>
//             <img src={Edit} alt="" />
//             </Link>
//             <img src={Delete} alt="" />
//           </div>
//          ) }
//         </div>
//         <h1>{post.title}</h1>
//              </div>
//              <div>{post.desc}</div>

//     </div>
//   );
// };

// export default Single;
import React, { useEffect, useState } from "react";
import Edit from "../img/edit.png";
import Delete from "../img/delete.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

const Single = () => {
  const [post, setPost] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  const postId = location.pathname.split("/")[2];

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [postId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/posts/${postId}`, { withCredentials: true }); // Ensure withCredentials is set for cookie-based authentication
      navigate("/"); // Redirect after deleting
    } catch (err) {
      console.log(err);
      alert("Failed to delete the post");
    }
  };

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent;
  };

  return (
    <div className="single">
      <div className="content">
        <div className="img">
           <img
            src={
              post?.img && post.img.startsWith("http") // Check if post image is an external URL
                ? post.img // If it's an external URL, use it directly
                : post?.img // Else use the local image path (already relative)
            }
            alt="Post image"
          />
        </div>{" "}
        <div className="user">
          {post.userImg && <img src={post.userImg} alt="" />}
          <div className="info">
            <span>{post.username}</span>
            <p>
              Posted {post?.date ? moment(post.date).fromNow() : "Unknown date"}
            </p>
          </div>
          {currentUser.username === post.username && (
            <div className="edit">
              <Link to={`/write?edit=2`} state={post}>
                <img src={Edit} alt="" />
              </Link>
              <img onClick={handleDelete} src={Delete} alt="" />
            </div>
          )}
        </div>
        <h1>{post.title}</h1>
      </div>
    </div>
  );
};

export default Single;
