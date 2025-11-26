import { FaRegComment } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "react-hot-toast";
import { useState } from "react";

import { Link } from "react-router-dom";
import timeAgo from "../../functions/date";

const Post = ({ post }) => {
  const formattedPostDate = timeAgo(post.createdAt);
  const [comment, setComment] = useState("");
  const { data: authUserr } = useQuery({ queryKey: ["authUser"] }); //appel au fonction fetch User from app.jsx file

  const queryClient = useQueryClient();

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/post/delete/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete post");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post Deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/post/likeUnlike/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to like post");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Failed to like post");
      }
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        //update just the cache not all posts
        if (!oldData) return [];
        return oldData.map((p) =>
          p._id === post._id ? { ...p, likes: updatedLikes } : p
        );
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/post/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(res.error || "Failed to comment on post");
        }
        return data;
      } catch (error) {
        toast.error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); 
      setComment("");
      const modal = document.getElementById(`comments_modal${post._id}`);
      if (modal) modal.close();
    }
    
  });

  const postOwner = post.user;

  const isLiked =
    Array.isArray(post.likes) && authUserr?._id
      ? post.likes.includes(authUserr._id)
      : false;

  const isMyPost =
    authUserr?._id && post?.user?._id && authUserr._id === post.user._id;

  const handleDeletePost = (e) => {
    e.preventDefault();
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.firstName}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img
              src={
                postOwner.profileImg ||
                (postOwner.gender === "Male"
                  ? "/avatars/men.png"
                  : "/avatars/women.png")
              }
            />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner._id}`} className="font-bold">
              {postOwner.firstName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.firstName}`}>
                @{postOwner.firstName}
                {postOwner.lastName}
              </Link>
              <span>·</span>
              <span>{formattedPostDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
                {isDeleting && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {Array.isArray(post.comments) &&
                      post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div
                          key={comment._id || Math.random()}
                          className="flex gap-2 items-start"
                        >
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img
                                src={
                                  comment.user.profileImg ||
                                  (comment.user.gender === "Male"
                                    ? "/avatars/men.png"
                                    : "/avatars/women.png")
                                }
                                alt="avatar"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-bold w-20">
                                {comment.user.firstName} {comment.user.lastName}
                              </span>
                              <span className=" flex-grow w-60 ">
                                {" "}
                                <div className="divider"></div>
                              </span>
                              <span className="text-gray-700 text-sm">
                                <span>{formattedPostDate}</span>
                              </span>
                            </div>
                            <div className="text-sm">{comment.text}</div>
                          </div>
                          <div className="flex w-full flex-col "></div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No comments yet ! Be the first one 😉
                      </p>
                    )}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting ? <LoadingSpinner size="sm" /> : "Post"}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}

                {isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}
                <span
                  className={`text-sm  group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
                    }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
