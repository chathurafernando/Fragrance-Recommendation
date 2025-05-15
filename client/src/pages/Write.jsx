// import React, { useState } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import axios from "axios"
// import { useLocation } from "react-router-dom";
// import moment from"moment"

// const Write = () => {
//   const state = useLocation().state
//   const [value, setValue] = useState(state?.title||"");
//   const [title, setTitle] = useState(state?.desc||"");
//   const [file, setFile] = useState(null);
//   const [cat, setCat] = useState(state?.cat||"");

//   const upload = async () =>{
//     try{
//       const formData = new FormData();
//       formData.append("file",file)
//       const res = await axios.post("/upload", formData);
//       return res.data.imageUrl;
//       console.log("Data"+ res.data)
//     }
//     catch(err){
//       console.log(err)
//     }
//   }

//   console.log(value);

// const handleClick = async e =>{
//   e.preventDefault()
//   const imgUrl = await upload()
//   const url = state ? `/api/posts/${state.id}` : "/api/posts";
//   console.log("Making request to:", imgUrl);

//   try{
//     state ? await axios.put(`/posts/${state.id}`,{
//       title,
//       desc:value,
//       cat,
//       img:file? imgUrl:""
//     }):
//     await axios.post(`/posts`, {
//       title,
//       desc:value,
//       cat,
//       img:file? imgUrl:"",
//       date:moment(Date.now()).format("YYYY-MM-DD HH::mm:ss")
//     })
//   }catch(err){
//     console.error("Axios Error:", err);
//   }
// }

// return (
//     <div className="add">
//       <div className="content">
//         <input
//           type="text"
//           placeholder="Title"
//           onChange={(e) => setTitle(e.target.value)}
//         />
//         <div className="editorContainer">
//           <ReactQuill
//             className="editor"
//             theme="snow"
//             value={value}
//             onChange={setValue}
//           />
//         </div>
//       </div>
//       <div className="menu">
//         <div className="item">
//           <h1>Publish</h1>
//           <span>
//             <b>Status: </b> Draft
//           </span>
//           <span>
//             <b>Visibility: </b> Public
//           </span>
//           <input
//             style={{ display: "none" }}
//             type="file"
//             id="file"
//             name=""
//             onChange={(e) => setFile(e.target.files[0])}
//           />
//           <label className="file" htmlFor="file">
//             Upload Image
//           </label>
//           <div className="buttons">
//             <button>Save as a draft</button>
//             <button onClick={handleClick}>Publish</button>
//           </div>
//         </div>
//         <div className="item">
//           <h1>Category</h1>
//           <div className="cat">
//             <input
//               type="radio"
//               checked={cat === "art"}
//               name="cat"
//               value="art"
//               id="art"
//               onChange={(e) => setCat(e.target.value)}
//             />
//             <label htmlFor="art">Art</label>
//           </div>
//           <div className="cat">
//             <input
//               type="radio"
//               checked={cat === "science"}
//               name="cat"
//               value="science"
//               id="science"
//               onChange={(e) => setCat(e.target.value)}
//             />
//             <label htmlFor="science">Science</label>
//           </div>
//           <div className="cat">
//             <input
//               type="radio"
//               checked={cat === "technology"}
//               name="cat"
//               value="technology"
//               id="technology"
//               onChange={(e) => setCat(e.target.value)}
//             />
//             <label htmlFor="technology">Technology</label>
//           </div>
//           <div className="cat">
//             <input
//               type="radio"
//               checked={cat === "cinema"}
//               name="cat"
//               value="cinema"
//               id="cinema"
//               onChange={(e) => setCat(e.target.value)}
//             />
//             <label htmlFor="cinema">Cinema</label>
//           </div>
//           <div className="cat">
//             <input
//               type="radio"
//               checked={cat === "design"}
//               name="cat"
//               value="design"
//               id="design"
//               onChange={(e) => setCat(e.target.value)}
//             />
//             <label htmlFor="design">Design</label>
//           </div>
//           <div className="cat">
//             <input
//               type="radio"
//               checked={cat === "food"}
//               name="cat"
//               value="food"
//               id="food"
//               onChange={(e) => setCat(e.target.value)}
//             />
//             <label htmlFor="food">Food</label>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Write;
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import moment from "moment";

const Write = () => {
  const state = useLocation().state;
  const [value, setValue] = useState(state?.title || "");
  const [title, setTitle] = useState(state?.desc || "");
    const [desc, setDesc] = useState('');
  
  const [file, setFile] = useState(null);
    const [date, setDate] = useState('2025-03-10T05:00:00.000Z');
  
  const [category, setCat] = useState(state?.category || "");

  const handleClick = async (e) => {
  e.preventDefault();

  // Prepare FormData for file upload and post data
  // const formData = new FormData();
  // formData.append("image", file);
  // formData.append("title", title);
  // formData.append("desc", value);
  // formData.append("cat", cat);
  // formData.append("date", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));

  const formData = {
    image: file,
    title,
    value,
    desc,
    category,
    date
    
  };

  console.log("Form Data :"+ formData)

  const url = state ? `/posts/${state.id}` : "/posts";
  console.log("Making request to:", url);

  try {
    console.log("Request data being sent:", formData);
    
    // Send the POST request with FormData (file and post data)
    if (state) {
      // Update existing post
      await axios.put(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Post updated successfully.");
    } else {
      // Create new post
      await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Post created successfully.");
    }
  } catch (err) {
    console.error("Axios Error:", err);
  }
};



  return (
    <div className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
          value={title} // Use value for input binding
        />
        <div className="editorContainer">
          <ReactQuill
            className="editor"
            theme="snow"
            value={value}
            onChange={setValue}
          />
        </div>
      </div>
      <div>
          <label>Description:</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Enter description"
          />
         
        </div>
      <div className="menu">
        <div className="item">
          <h1>Publish</h1>
          <span>
            <b>Status: </b> Draft
          </span>
          <span>
            <b>Visibility: </b> Public
          </span>
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            name="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label className="file" htmlFor="file">
            Upload Image
          </label>
          <div className="buttons">
            <button>Save as a draft</button>
            <button onClick={handleClick}>Publish</button>
          </div>
        </div>
        <div>
          <label>Date:</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="item">
          <h1>Category</h1>
          <div className="cat">
            <input
              type="radio"
              checked={category === "art"}
              name="cat"
              value="art"
              id="art"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="art">Art</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={category === "science"}
              name="cat"
              value="science"
              id="science"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="science">Science</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={category === "technology"}
              name="cat"
              value="technology"
              id="technology"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="technology">Technology</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={category === "cinema"}
              name="cat"
              value="cinema"
              id="cinema"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="cinema">Cinema</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={category === "design"}
              name="cat"
              value="design"
              id="design"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="design">Design</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={category === "food"}
              name="cat"
              value="food"
              id="food"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="food">Food</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Write;
