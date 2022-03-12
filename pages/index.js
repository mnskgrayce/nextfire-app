import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";
import { db, postToJSON } from "../lib/firebase";
import {
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import Metatags from "../components/Metatags";

import { useState } from "react";

// Max post to query per page
const LIMIT = 1;

export async function getServerSideProps(context) {
  const postsQuery = query(
    collectionGroup(db, "posts"),
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    limit(LIMIT)
  );

  const posts = (await getDocs(postsQuery)).docs.map(postToJSON);

  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor =
      typeof last.createdAt === "number"
        ? Timestamp.fromMillis(last.createdAt)
        : last.createdAt;

    const q = query(
      collectionGroup(db, "posts"),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      startAfter(cursor),
      limit(LIMIT)
    );

    const newPosts = (await getDocs(q)).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <Metatags title="Home Page"></Metatags>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && "You have reached the end!"}
    </main>
  );
}
