import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Posts from "../../../components/common/Posts";
import ProfileHeaderSkeleton from "../../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import useFollowUnfollowUser from "../../../components/hooks/FollowUnfollowUser";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import moment from "moment";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const ProfilePage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { followUnfollow, isPending } = useFollowUnfollowUser();
  const { id } = useParams();

  const cleanId = id.replace(/[^a-fA-F0-9]/g, "");

  const fetchUserProfile = async () => {
    const res = await fetch(`/api/user/profile/${cleanId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch user profile");
    }
    return res.json();
  };

  const { data: user, error, isLoading } = useQuery({
    queryKey: ["userProfile", cleanId],
    queryFn: fetchUserProfile,
    enabled: !!cleanId, 
  });

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/user/update/${cleanId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImg, profileImg }),
      });
      if (!res.ok) {
        throw new Error("Profile update failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      queryClient.setQueryData(["userProfile", cleanId], (prev) => ({
        ...prev,
        ...data,
      }));
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isMyProfile = authUser?._id === user?._id;
  const amIFollowing = authUser?.following.includes(user?._id);

  const handleImgChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === "coverImg") setCoverImg(reader.result);
      if (type === "profileImg") setProfileImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    updateProfile();
  };

  return (
    <>
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        {isLoading && <ProfileHeaderSkeleton />}
        {!isLoading && !user && <p className="text-center text-lg mt-4">User not found</p>}

        <div className="flex flex-col">
          {!isLoading && user && (
            <>
              <div className="flex gap-10 px-4 py-2 items-center">
                <Link to="/">
                  <FaArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{user?.firstName}</p>
                  <span className="text-sm text-slate-500">{user?.posts?.length} posts</span>
                </div>
              </div>

              {/* COVER IMAGE */}
              <div className="relative group/cover">
                <img
                  src={coverImg || user?.coverImg || "/avatars/0_ENYaSHiiJberibb9.jpg"}
                  className="h-52 w-full object-cover"
                  alt="cover"
                />
                {isMyProfile && (
                  <div
                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="w-5 h-5 text-white" />
                  </div>
                )}
                <input type="file" hidden ref={coverImgRef} onChange={(e) => handleImgChange(e, "coverImg")} />
                <input type="file" hidden ref={profileImgRef} onChange={(e) => handleImgChange(e, "profileImg")} />

                {/* USER AVATAR */}
                <div className="avatar absolute -bottom-16 left-4">
                  <div className="w-32 rounded-full relative group/avatar">
                    <img
                      src={profileImg || user.profileImg || (user.gender === "Male"
                        ? "/avatars/men.png"
                        : "/avatars/women.png")}
                      className="rounded-full"
                    />
                    {isMyProfile && (
                      <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                        <MdEdit className="w-4 h-4 text-white" onClick={() => profileImgRef.current.click()} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end px-4 mt-5">
                {isMyProfile && <EditProfileModal authUser={authUser} cleanId={cleanId} />}
                {!isMyProfile && (
                  <button className="btn btn-outline rounded-full btn-sm" onClick={() => followUnfollow(user._id)}>
                    {isPending ? <LoadingSpinner size="sm" /> : amIFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
                {(coverImg || profileImg) && (
                  <button className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2" onClick={onSubmit}>
                    {isUpdatingProfile ? <LoadingSpinner size="sm" /> : "Update"}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-14 px-4">
                <span className="font-bold text-lg">{user?.firstName} {user?.lastName}</span>
                <span className="text-sm text-slate-500">@{user?.firstName}{user?.lastName} {user?.situation && <span className="text-teal-100">"{user?.situation}"</span>}</span>
                <span className="text-sm my-1 ">{user?.bio && "About Me : "}{user?.bio}</span>
                <div className="flex gap-2">
                  {user?.links && (
                    <div className='flex gap-1 items-center '>
                      <>
                        <FaLink className='w-3 h-3 text-slate-500' />
                        <a
                          href={user?.links}
                          target='_blank'
                          rel='noreferrer'
                          className='text-sm text-blue-500 hover:underline'
                        >
                          {user?.links}
                        </a>
                      </>
                    </div>
                  )}
                  <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">
                    Joined {moment(user.createdAt).format("DD/MM/YYYY")}
                  </span>
                </div>
                <div className="flex justify-between w-40">
                  <div className='flex gap-1 items-center'>
                    <span className='font-bold text-xs'>{user?.following.length}</span>
                    <span className='text-slate-500 text-xs'>Following</span>
                  </div>
                  <div className='flex gap-1 items-center'>
                    <span className='font-bold text-xs'>{user?.followers.length}</span>
                    <span className='text-slate-500 text-xs'>Followers</span>
                  </div>
                </div>
              </div>
              <div className='flex w-full border-b border-gray-700 mt-4'>
                <div
                  className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
                  )}
                </div>
                <div
                  className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer'
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary' />
                  )}
                </div>
              </div>
              <Posts feedType={feedType} UserId={cleanId} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
