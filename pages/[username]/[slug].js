import styles from "../../styles/Post.module.css";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db, getUserWithUsername, postToJSON } from "../../lib/firebase";
import {
  doc,
  getDoc,
  collectionGroup,
  query,
  getDocs,
} from "firebase/firestore";

import PostContent from "../../components/PostContent";
import HeartButton from "../../components/HeartButton";
import AuthCheck from "../../components/AuthCheck";
import Link from "next/link";

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = doc(db, "users", userDoc.id, "posts", slug);
    const postSnap = await getDoc(postRef);
    post = postToJSON(postSnap);
    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  // Improve by using Admin SDK to select empty docs
  const posts = query(collectionGroup(db, "posts"));
  const snapshot = await getDocs(posts);

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    fallback: "blocking",
  };
}

export default function Post(props) {
  const postRef = doc(db, props.path);
  const [realtimePost] = useDocumentData(postRef);

  const post = realtimePost || props.post;

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={post} />
      </section>

      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}
