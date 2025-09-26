import React, { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [posts, setPosts] = useState([]);
  useEffect(()=> {
    axios.get(process.env.REACT_APP_POST_API || "http://localhost:5103/api/posts")
      .then(r=>setPosts(r.data))
      .catch(()=>setPosts([]));
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h1>BlogOps - posts</h1>
      <ul>
        {posts.map(p => <li key={p.id || p.title}><b>{p.title}</b><div>{p.body}</div></li>)}
      </ul>
    </div>
  );
}
