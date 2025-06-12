import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getUserById,
  updateUser,
  updateUserBoxingVideoWithProgress,
} from "../../services/userService";
import { useLanguage } from "../../context/LanguageContext";
import SimpleModal from "../SimpleModal/SimpleModal";
import {
  getFollowers,
  getFollowing,
  getFollowCounts,
  followUser,
  unfollowUser,
  removeFollower,
  FollowCounts,
  FollowerDoc,
} from "../../services/followService";

interface ProfileProps {
  user: { id: string; name: string } | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    weight: "",
    city: "",
    birthdate: "",
    password: "",
    profilePicture: "",
    gender: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [userVideoUrl, setUserVideoUrl] = useState<string>("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [hovered, setHovered] = useState<"photo" | "video" | null>(null);

  // Seguidores/seguidos
  const [followCounts, setFollowCounts] = useState<FollowCounts>({
    followers: 0,
    following: 0,
  });
  const [followersList, setFollowersList] = useState<FollowerDoc[]>([]);
  const [followingList, setFollowingList] = useState<FollowerDoc[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loadingFollows, setLoadingFollows] = useState(false);
  const [loadingFollowAction, setLoadingFollowAction] = useState<string | null>(null);

  const fetchUserData = React.useCallback(async () => {
  try {
    if (!user?.id) return; // Si no hay usuario, no intentes llamar
    const userData = await getUserById(user.id);
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        weight: userData.weight || "",
        city: userData.city || "",
        birthdate: userData.birthDate
          ? new Date(userData.birthDate).toISOString().split("T")[0]
          : "",
        password: "",
        profilePicture: userData.profilePicture || "",
        gender: userData.gender || "",
      });
      setPreviewImage(userData.profilePicture || null);
      setUserVideoUrl(userData.boxingVideo || "");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Cargar contadores y listas de seguidores/seguidos
  useEffect(() => {
    if (!user) return;
    getFollowCounts(user.id)
      .then((res) => {
        setFollowCounts({
          followers: res.data.followers,
          following: res.data.following,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [user]);

  const fetchFollowersList = async () => {
    if (!user) return;
    setLoadingFollows(true);
    try {
      const res = await getFollowers(user.id);
      setFollowersList(res.data?.followers || []);
      // También refresca la lista de following para saber si ya sigues a alguien
      const resFollowing = await getFollowing(user.id);
      setFollowingList(resFollowing.data?.following || []);
    } finally {
      setLoadingFollows(false);
    }
  };

  const fetchFollowingList = async () => {
    if (!user) return;
    setLoadingFollows(true);
    try {
      const res = await getFollowing(user.id);
      setFollowingList(res.data?.following || []);
    } finally {
      setLoadingFollows(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setProfilePictureFile(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      // Solo incluye password si no está vacío
      const updatedUser: any = {
        ...formData,
        birthDate: new Date(formData.birthdate),
      };
      if (!formData.password) {
        delete updatedUser.password;
      }

      let result;
      if (profilePictureFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("profilePicture", profilePictureFile);

        Object.entries(updatedUser).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, value.toString());
          }
        });

        result = await updateUser(user.id, formDataToSend);
      } else {
        result = await updateUser(user.id, updatedUser);
      }
      if (!result) {
        setModalMsg(t("saveError"));
        setModalOpen(true);
        return;
      }
      setModalMsg(t("saveSuccess"));
      setModalOpen(true);
      await fetchUserData();
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error(t("saveError"), error);
      setModalMsg(t("saveError"));
      setModalOpen(true);
    }
  };

  // VIDEO: Subida y borrado
  const handleVideoUpload = async () => {
    if (!videoFile) return;
    const userData = localStorage.getItem("userData");
    if (!userData) return;
    const { id } = JSON.parse(userData);
    setUploadProgress(0);
    try {
      const res = await updateUserBoxingVideoWithProgress(
        id,
        videoFile,
        setUploadProgress
      );
      setUserVideoUrl(res.boxingVideo);
      setVideoFile(null);
      setUploadProgress(0);
    } catch (err) {
      setModalMsg("Error al subir el video");
      setModalOpen(true);
      setUploadProgress(0);
    }
  };

  // Mostrar lista de seguidores
  const handleShowFollowers = () => {
    setShowFollowers((prev) => !prev);
    setShowFollowing(false);
    if (!showFollowers) fetchFollowersList();
  };

  // Mostrar lista de seguidos
  const handleShowFollowing = () => {
    setShowFollowing((prev) => !prev);
    setShowFollowers(false);
    if (!showFollowing) fetchFollowingList();
  };

  // Seguir usuario desde lista de seguidores
  const handleFollowBack = async (followerId: string) => {
    setLoadingFollowAction(followerId);
    await followUser(followerId);
    await fetchFollowersList();
    await fetchFollowingList();
    const res = await getFollowCounts(user!.id);
    const { followers, following } = res.data || {};
    setFollowCounts({
      following: following ?? 0,
      followers: followers ?? 0,
    });
    setLoadingFollowAction(null);
  };

  // Dejar de seguir usuario desde lista de seguidos
  const handleUnfollow = async (followingId: string) => {
    setLoadingFollowAction(followingId);
    await unfollowUser(followingId);
    await fetchFollowingList();
    const res = await getFollowCounts(user!.id);
    const { followers, following } = res.data || {};
    setFollowCounts({
      following: following ?? 0,
      followers: followers ?? 0,
    });
    setLoadingFollowAction(null);
  };

  // Eliminar seguidor
  const handleRemoveFollower = async (followerId: string) => {
    setLoadingFollowAction(followerId);
    await removeFollower(followerId);
    await fetchFollowersList();
    const res = await getFollowCounts(user!.id);
    const { followers, following } = res.data || {};
    setFollowCounts({
      following: following ?? 0,
      followers: followers ?? 0,
    });
    setLoadingFollowAction(null);
  };

  return (
    <StyledProfile>
      {/* --- NUEVA SECCIÓN DE CONTADORES Y LISTAS --- */}
      <FollowStatsBar>
        <FollowStat onClick={handleShowFollowing}>
          <span className="count">{followCounts.following}</span>
          <span className="label">Siguiendo</span>
        </FollowStat>
        <FollowStat onClick={handleShowFollowers}>
          <span className="count">{followCounts.followers}</span>
          <span className="label">Seguidores</span>
        </FollowStat>
      </FollowStatsBar>
      {/* Listas desplegables */}
      {showFollowing && (
        <FollowList>
          <h4>Usuarios que sigues</h4>
          {loadingFollows ? (
            <p>Cargando...</p>
          ) : followingList.length === 0 ? (
            <p>No sigues a nadie aún.</p>
          ) : (
            <ul>
              {followingList.map((rel) => (
                <li key={rel._id}>
                  <span>{rel.following.name}</span>
                  <button
                    className="unfollow-btn"
                    onClick={() => handleUnfollow(rel.following._id)}
                    disabled={loadingFollowAction === rel.following._id}
                  >
                    {loadingFollowAction === rel.following._id ? "..." : "Dejar de seguir"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </FollowList>
      )}
      {showFollowers && (
        <FollowList>
          <h4>Usuarios que te siguen</h4>
          {loadingFollows ? (
            <p>Cargando...</p>
          ) : followersList.length === 0 ? (
            <p>No tienes seguidores aún.</p>
          ) : (
            <ul>
              {followersList.map((rel) => {
                const follower = rel.follower;
                const isFollowing = followingList.some(
                  (f) => f.following._id === follower._id
                );
                return (
                  <li key={follower._id}>
                    <span>{follower.name}</span>
                    {!isFollowing && (
                      <button
                        className="follow-btn"
                        onClick={() => handleFollowBack(follower._id)}
                        disabled={loadingFollowAction === follower._id}
                      >
                        {loadingFollowAction === follower._id ? "..." : "Seguir también"}
                      </button>
                    )}
                    <button
                      className="remove-follower-btn"
                      onClick={() => handleRemoveFollower(follower._id)}
                      disabled={loadingFollowAction === follower._id}
                    >
                      {loadingFollowAction === follower._id ? "..." : "Eliminar seguidor"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </FollowList>
      )}
      {/* --- FIN NUEVA SECCIÓN --- */}
      <h2>{t("profileTitle")}</h2>
      <div
        className="profile-picture"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          marginBottom: "20px",
          position: "relative",
          textAlign: "center",
        }}
      >
        {previewImage ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <img
              src={previewImage}
              alt={t("profilePictureLabel")}
              className="profile-img"
            />
            <button
              type="button"
              className="delete-photo-btn"
              style={{
                position: "static",
                background: "#d62828",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 22,
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "background 0.2s",
              }}
              onClick={async () => {
                const userData = localStorage.getItem("userData");
                if (!userData) return;
                const { id } = JSON.parse(userData);
                await updateUser(id, { profilePicture: "" });
                setPreviewImage("");
                setProfilePictureFile(null);
              }}
              title="Eliminar foto"
            >
              🗑️
            </button>
          </div>
        ) : (
          <p>{t("noProfilePicture")}</p>
        )}
        <label
          htmlFor="file-upload"
          className={`custom-file-upload ${previewImage ? "has-image" : ""}`}
        >
          {previewImage ? t("changeProfilePicture") : t("chooseProfilePicture")}
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      </div>
      {/* VIDEO */}
      <div
        className="profile-video-upload"
        style={{ textAlign: "center", marginTop: 20 }}
      >
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setVideoFile(e.target.files[0]);
            }
          }}
        />
        <button
          type="button"
          className="custom-file-upload"
          onClick={() => document.getElementById("video-upload")?.click()}
          style={{ marginTop: 10 }}
        >
          {userVideoUrl ? t("changeBoxingVideo") : t("uploadBoxingVideo")}
        </button>
        {videoFile && (
          <>
            <button
              type="button"
              className="save-button"
              style={{ marginLeft: 10 }}
              onClick={handleVideoUpload}
            >
              {t("saveButton")}
            </button>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ width: 320, margin: "10px auto" }}>
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: 8,
                    background: "#2ecc40",
                    borderRadius: 4,
                    transition: "width 0.3s",
                  }}
                />
                <span style={{ color: "#fff", fontSize: 12 }}>
                  {uploadProgress}%
                </span>
              </div>
            )}
          </>
        )}
        {userVideoUrl && (
          <div
            style={{
              marginTop: 12,
              position: "relative",
              display: "inline-block",
              textAlign: "center",
            }}
            onMouseEnter={() => setHovered("video")}
            onMouseLeave={() => setHovered(null)}
          >
            <video src={userVideoUrl} controls width={320} />
            {hovered === "video" && (
              <button
                type="button"
                className="delete-photo-btn"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "#d62828",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 16,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={async () => {
                  const userData = localStorage.getItem("userData");
                  if (!userData) return;
                  const { id } = JSON.parse(userData);
                  await updateUser(id, { boxingVideo: "" });
                  setUserVideoUrl("");
                  setVideoFile(null);
                }}
                title="Eliminar video"
              >
                🗑️
              </button>
            )}
            {!userVideoUrl && (
              <button
                type="button"
                className="custom-file-upload"
                onClick={() => document.getElementById("video-upload")?.click()}
                style={{ marginTop: 32, display: "block", width: 320 }}
              >
                {t("uploadBoxingVideo")}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="profile-details">
        <div className="detail">
          <label>{t("nameLabel")}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>{t("birthdateLabel")}</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>{t("emailLabel")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>{t("genderLabel")}</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">{t("chooseGender")}</option>
            <option value="Hombre">{t("male")}</option>
            <option value="Mujer">{t("female")}</option>
          </select>
        </div>
        <div className="detail">
          <label>{t("weightLabel")}</label>
          <select name="weight" value={formData.weight} onChange={handleChange}>
            <option value="">{t("chooseWeight")}</option>
            <option value="Peso pluma">{t("featherweight_kg")}</option>
            <option value="Peso medio">{t("middleweight_kg")}</option>
            <option value="Peso pesado">{t("heavyweight_kg")}</option>
          </select>
        </div>
        <div className="detail">
          <label>{t("cityLabel")}</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>{t("phoneLabel")}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <button className="save-button" onClick={handleSave}>
          {t("saveButton")}
        </button>
      </div>
      <SimpleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
      />
    </StyledProfile>
  );
};

const StyledProfile = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: rgba(26, 26, 26, 0.9);
  color: white;
  position: relative;
  margin-top: 60px;

  h2 {
    text-align: center;
    margin-bottom: 20px;
    margin-top: 90px;
    font-size: 24px;
    color: #d62828;
  }

  .tabs {
    position: sticky;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px 0;
    background-color: rgba(26, 26, 26, 0.9);

    .tab {
      background: none;
      border: 2px solid #d62828;
      color: white;
      font-size: 18px;
      padding: 15px 30px;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s ease;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tab.active {
      background-color: #d62828;
      color: white;
    }

    .tab:hover {
      background-color: #a31f1f;
      border-color: #a31f1f;
    }
  }

  .profile-details {
    width: 90%;
    padding: 0 20px;
    margin-top: 20px;
    margin-bottom: 80px;

    .detail {
      margin-bottom: 15px;

      label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
        color: #d62828;
      }

      input,
      select {
        width: 100%;
        background-color: #333;
        padding: 15px;
        border: 1px solid #555;
        border-radius: 5px;
        color: white;
        font-size: 16px;
      }

      input:focus,
      select:focus {
        outline: none;
        border-color: #d62828;
      }
    }
  }

  .save-button {
    background-color: #d62828;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 20px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .save-button:hover {
    background-color: #a31f1f;
  }

  select {
    width: 100%;
    background-color: #333;
    padding: 15px;
    border: 1px solid #555;
    border-radius: 5px;
    color: white;
    font-size: 16px;
  }

  select:focus {
    outline: none;
    border-color: #d62828;
  }

  .profile-picture {
    text-align: center;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .profile-img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 10px;
    }

    input[type="file"] {
      display: block;
      margin: 0 auto;
    }
  }

  .custom-file-upload {
    display: inline-block;
    padding: 10px 20px;
    cursor: pointer;
    background-color: #d62828;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }

  .custom-file-upload.has-image {
    background-color: #a31f1f;
  }

  .custom-file-upload:hover {
    background-color: #a31f1f;
  }

  .custom-file-upload.has-image:hover {
    background-color: #388e3c;
  }

  .delete-photo-btn {
    top: 12px;
    right: 12px;
    background: #d62828;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    font-weight: bold;
    font-size: 22px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: background 0.2s;
  }

  .delete-photo-btn:hover {
    background: #a31f1f;
  }
`;

const FollowStatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
  margin-bottom: 10px;
`;

const FollowStat = styled.div`
  background: #222;
  border-radius: 10px;
  padding: 18px 32px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
  &:hover {
    background: #d62828;
    color: #fff;
  }
  .count {
    font-size: 2.2em;
    font-weight: bold;
    color: #d62828;
    display: block;
  }
  .label {
    font-size: 1.1em;
    color: #fff;
    margin-top: 4px;
  }
`;

const FollowList = styled.div`
  background: #181818;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 20px 30px;
  margin: 0 auto 20px auto;
  max-width: 400px;
  color: #fff;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #333;
      &:last-child {
        border-bottom: none;
      }
      span {
        font-size: 1.1em;
      }
      button {
        margin-left: 10px;
        padding: 5px 12px;
        border: none;
        border-radius: 5px;
        font-size: 0.95em;
        cursor: pointer;
        transition: background 0.2s;
      }
      .follow-btn {
        background: #388e3c;
        color: #fff;
      }
      .unfollow-btn {
        background: #d62828;
        color: #fff;
      }
      .remove-follower-btn {
        background: #444;
        color: #fff;
      }
      .follow-btn:hover {
        background: #2e7031;
      }
      .unfollow-btn:hover {
        background: #a31f1f;
      }
      .remove-follower-btn:hover {
        background: #222;
      }
    }
  }
`;

export default Profile;