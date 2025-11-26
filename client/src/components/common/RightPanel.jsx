import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import useFollowUnfollowUser from "../hooks/FollowUnfollowUser";
import LoadingSpinner from "./LoadingSpinner";
import { IoStatsChartOutline } from "react-icons/io5";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
const RightPanel = () => {
  const { followUnfollow, isPending } = useFollowUnfollowUser(); //appel au hook de followUnfollow

  const { data: authUserr } = useQuery({ queryKey: ["authUser"] }); //appel au fonction fetch authenticated User from app.jsx file

  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers", authUserr?._id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/user/suggested/${authUserr._id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  if (suggestedUsers?.length === 0 && isLoading) {
    return (
      <div className="hidden md:w-52 lg:w-64 md:block my-4 mx-2">
        <div className="font-extrabold mx-10 ">Who to follow</div>
        <p className="flex mx-12 my-40">No suggested users yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block my-4 mx-2">
        <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
          <p className=" mb-3 divider divider-accent">
            Who to follow
            <AiOutlineUsergroupAdd className="w-20" />
          </p>
          <div className="flex flex-col gap-4">
            {isLoading && (
              <>
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </>
            )}
            {!isLoading &&
              suggestedUsers?.map((user) => (
                <Link
                  to={`/profile/${user._id}}`}
                  className="flex items-center justify-between gap-4"
                  key={user._id}
                >
                  <div className="flex gap-2 items-center">
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={
                            user.profileImg ||
                            (user.gender === "Male"
                              ? "/public/avatars/men.png"
                              : "/public/avatars/women.png")
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold tracking-tight truncate w-28">
                        {user.firstName}
                      </span>
                      <span className="text-sm text-slate-500">
                        @{user.firstName}
                        {user.lastName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        followUnfollow(user._id);
                      }}
                    >
                      {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                    </button>
                  </div>
                </Link>
              ))}
          </div>
         <div className="divider divider-accent">
            Statics
            <IoStatsChartOutline className="w-20" />
          </div>
          <div className="stats stats-vertical shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Followers</div>
              <div className="stat-value text-primary">
                {authUserr.followers.length}
              </div>
            </div>
            <br />
            <div className="stat">
              <div className="stat-figure text-primary">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Following</div>
              <div className="stat-value text-primary">
                {authUserr.following.length}
              </div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <div className="avatar online">
                  <div className="w-16 rounded-full">
                    <img
                      src={
                        authUserr.profileImg ||
                        (authUserr.gender === "Male"
                          ? "/public/avatars/men.png"
                          : "/public/avatars/women.png")
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="stat-title">
                @{authUserr.firstName} {authUserr.lastName}
              </div>
              <div className="stat-desc">{authUserr.createdAt}</div>
            </div>
          </div> 
        </div>
      </div>
      <div className="hidden lg:block my-4 mx-2"></div>
    </>
  );
};
export default RightPanel;
