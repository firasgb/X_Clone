import { Link } from "react-router-dom";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaRegComments } from "react-icons/fa";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { FcAddDatabase } from "react-icons/fc";
import timeAgo from "../../../functions/date";
import { IoTrashBin } from "react-icons/io5";

const NotificationPage = () => {

  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [feedType, setFeedType] = useState("forYou");

  const getPostEndpoint = (feedType) => {
    return feedType === "All"
      ? "/api/notification/getNotifications"
      : "/api/notification/getMyNotifications";
  };
  const POST_ENDPOINT = getPostEndpoint(feedType);

  {/* get all notifications or my notifications selon feedType */ }
  const {
    data: notifications,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["notifications"], // we use queryKey to give a unique name to query and refer to it later in any file
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        const data = await res.json();
        if (data.error) return null; // even if the user is not authenticated data is returned as an empty object, so we make it null in error cases
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch notifications");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Failed to fetch notifications");
      }
    },
    retry: false, // by default 4 requests are sent; setting this to false sends only 1 request
  });

  {/* delete all notification */ }
  const {mutate:deleteNotifications,isPending: isDeleting,refetch: refetchDelete,isRefetching:isRefetchingDelete}=useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notification/deleteNotifications",{
          method: "DELETE",
        });
        const data = await res.json();
        if (data.error)
          throw new Error(data.error || "Failed to delete all notifications");
        if (!res.ok) {
          throw new Error(data.error || "Failed to delete all notifications");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Failed to delete all notifications");
      }
    },
    onSuccess: () => {
      toast.success("All notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error("Failed to delete all notifications: " + error.message);
    },
    retry: false, // by default 4 requests are sent; setting this to false sends only 1 request
  });

  {/* delete one notification */ }
  const {mutate: deleteOneNotification,isPending: isDeletingOne,refetch: refetchDeleteOne,isRefetching: isRefetchingDeleteOne,} = useMutation({
    mutationFn: async (notificationId) => {
      try {
        const res = await fetch(`/api/notification/deleteOnlyNotification/${notificationId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to delete notification");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Failed to delete notification");
      }
    },
    onSuccess: () => {
      toast.success("Notification deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error("Failed to delete notification: " + error.message);
    },
    retry: false,
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  const deleteAllNotifications = (e) => {
    e.preventDefault();
    deleteNotifications();
  };

  const handleDeleteOneNotification = (e) => {
    e.preventDefault();
    deleteOneNotification();
  };

  const filterNotifications = (notification) => {
    if (feedType === "All") {
      return (
        notification.sender?._id !== authUser._id && notification.recipient?._id !== authUser._id && notification.type !== "follow"
      );
    }
    else {
      return (
        notification.sender?._id !== authUser._id && notification.recipient?._id !== authUser._id
      )
    }
  };

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
      <div className="sticky stats shadow top-0 left-0 bg-rose- w-full z-10 flex flex-col">
        <div className="border-b-2 border-gray-300">
          {/* Header */}
          <div className="flex w-full border-b border-gray-700">
            <div
              className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
              onClick={() => setFeedType("forYou")}
            >
              For you
              {feedType === "forYou" && (
                <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
              )}
            </div>
            <div
              className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
              onClick={() => setFeedType("All")}
            >
              All
              {feedType === "All" && (
                <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
              )}
            </div>
          </div>
        </div>

        <div className="stats shadow-[0_4px_10px_rgba(0,100,200,0.1)] ">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Notifications</div>
            <div className="stat-value">{notifications?.length}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Followers</div>
            <div className="stat-value">{authUser?.followers.length}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Following</div>
            <div className="stat-value">{authUser?.following.length}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <p className="font-bold">Notifications</p>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="m-1">
            <IoSettingsOutline className="w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a onClick={deleteAllNotifications}>Delete all notifications</a>
            </li>
          </ul>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {!isLoading && (!notifications || notifications.length === 0) && (
        <div className="text-center p-4 font-bold">No notifications 🤔</div>
      )}
      {notifications &&
        notifications.length > 0 &&
        notifications.filter(filterNotifications).map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex justify-between">
              <div className="flex gap-2 p-4">
                {/* notification logo*/}
                {notification.type === "follow" && (
                  <FaUser className="w-7 h-5 text-success" />
                )}

                {notification.type === "like" && (
                  <FaHeart className="w-7 h-5 text-red-900" />
                )}

                {notification.type === "comment" && (
                  <FaRegComments className="text-primary" />
                )}

                {feedType === "All" && notification.type === "create" && (
                  <FcAddDatabase />
                )}

                <div className="avatar-group -space-x-6 rtl:space-x-reverse">
                  {notification.sender._id !== authUser._id &&
                    <Link to={`/profile/${notification.sender?._id}`}>
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img
                            src={
                              notification.sender?.profileImg ||
                              (notification.sender?.gender === "Male"
                                ? "/avatars/men.png"
                                : "/avatars/women.png")
                            }
                            alt="Sender Avatar"
                          />
                        </div>
                      </div>
                    </Link>
                  }
                  {feedType === "All" && notification.type !== "create" && notification.recipient._id !== authUser._id && notification.sender._id !== notification.recipient._id &&
                    <Link to={`/profile/${notification.recipient?._id}`}>
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img
                            src={
                              notification.recipient?.profileImg ||
                              (notification.recipient?.gender === "Male"
                                ? "/avatars/men.png"
                                : "/avatars/women.png")
                            }
                            alt="reciepient Avatar"
                          />
                        </div>
                      </div>
                    </Link>
                  }
                </div>

                <div className="flex gap-1">
                  {notification.sender?._id !== authUser._id &&
                    <span className="font-bold">
                      @{notification.sender?.firstName}{" "}
                      {notification.sender?.lastName}
                    </span>
                  }

                  {feedType === "forYou"
                    ? notification.type === "follow"
                      ? " followed you"
                      : notification.type === "like"
                        ? notification.sender?._id === notification.recipient?._id
                          ? " liked their own post"
                          : " liked your post"
                        : notification.type === "comment"
                          ? notification.sender?._id === notification.recipient?._id
                            ? " commented on their own post"
                            : " commented on your post"
                          : ""
                    : notification.type === "follow"
                      ? " followed "
                      : notification.type === "like"
                        ? notification.sender?._id === notification.recipient?._id
                          ? "liked their own post"
                          : " liked post of "
                        : notification.type === "comment"
                          ? notification.sender?._id === notification.recipient?._id
                            ? " commented on their own post"
                            : " commented on post of "
                          : notification.type === "create"
                            ? " added a new post"
                            : ""
                  }

                  {feedType === "All" &&
                    notification.sender?._id !== notification.recipient?._id &&
                    notification.recipient &&
                    notification.type !== "create" && (
                      <span className="font-bold">
                        @{notification.recipient.firstName} {notification.recipient.lastName}
                      </span>
                    )}
                </div>
              </div>
              <button
                className="p-5"
                aria-label="Delete Notification"
                onClick={() => handleDeleteOneNotification(notification)}
              >
                <IoTrashBin
                  className="cursor-pointer hover:text-red-700"
                  size={14}
                  onClick={() => deleteOneNotification(notification._id)}
                />
              </button>

            </div>
            {notification.type === "comment" && (
              <div className="collapse bg-base-200 min-h-0">
                <input type="checkbox" />
                <div className="collapse-title flex justify-between items-center py-2">
                  <span>Read more ...</span>
                  <span className="text-end text-sm">{timeAgo(notification.createdAt)}</span>
                </div>
                <div className="collapse-content p-2">
                  <p>{notification.commentText}</p>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default NotificationPage;
