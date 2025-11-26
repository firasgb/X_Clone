import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, UserId }) => {
  const queryClient = useQueryClient();

  const getPostEndpoint = (feedType) => {
    if (feedType === "forYou") return "/api/post/all";
    if (feedType === "following") return "/api/post/following";
    if (feedType === "posts") return `/api/post/userPost/${UserId}`;
    if (feedType === "likes") return `/api/post/likes/${UserId}`;
    return "/api/post/all";
  };

  const POST_ENDPOINT = getPostEndpoint(feedType);

  const { data: posts, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch(POST_ENDPOINT);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch posts");
      return data;
    }
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, UserId]);

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const res = await fetch(`/api/post/like/${postId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like post");
      return res.json();
    },
    onMutate: (postId) => {
      queryClient.setQueryData(["posts", feedType], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((post) =>
          post._id === postId
            ? { ...post, isLiked: true, likesCount: post.likesCount + 1 }
            : post
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts", feedType]);
    },
  });

  // Unlike Mutation
  const unlikeMutation = useMutation({
    mutationFn: async (postId) => {
      const res = await fetch(`/api/post/unlike/${postId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to unlike post");
      return res.json();
    },
    onMutate: (postId) => {
      queryClient.setQueryData(["posts", feedType], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((post) =>
          post._id === postId
            ? { ...post, isLiked: false, likesCount: post.likesCount - 1 }
            : post
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts", feedType]);
    },
  });

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts?.map((post) =>
            post?._id ? (
              <Post
                key={post._id}
                post={post}
                onLike={() => likeMutation.mutate(post._id)}
                onUnlike={() => unlikeMutation.mutate(post._id)}
              />
            ) : null
          )}
        </div>
      )}
    </>
  );
};

export default Posts;
