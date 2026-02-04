import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function UpdateInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const userid = location.state.id;

  const [userdata, setuserdata] = useState({});
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [detailsUpdateSuccess, setDetailsUpdateSuccess] = useState(false);

  // Form fields for profile update
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  //-------------------------------------image------------------------------------------//

  const [image, setImage] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image first");
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "crypto_profile");
    data.append("cloud_name", "dcth4owgy");

    try {
      const cloudResponse = await fetch("https://api.cloudinary.com/v1_1/dcth4owgy/image/upload", {
        method: "post",
        body: data,
      });
      const cloudData = await cloudResponse.json();

      if (cloudData.url) {
        // Update the displayed image immediately
        setCurrentImageUrl(cloudData.url);

        const response = await fetch(
          "http://localhost:3001/dashboard/profileupdate",
          {
            method: "POST",
            body: JSON.stringify({ UserId: userid, ProfileUrl: cloudData.url }),
            mode: "cors",
            headers: {
              "Content-type": "application/json",
            },
          }
        );

        const json = await response.json();
        console.log("Image uploaded successfully:", json);
        setUploadSuccess(true);
        setUploading(false);
        setImage(""); // Clear the file input

        // Auto-hide success message after 3 seconds (stay on page, don't redirect)
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      } else {
        throw new Error("No URL returned from Cloudinary");
      }

    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
      setUploading(false);
    }
  };

  // Update user details (name, mobile)
  const updateUserDetails = async () => {
    // Convert mobile to string for safe trim operation
    const mobileStr = String(mobile || "").trim();
    const firstNameStr = String(firstName || "").trim();
    const lastNameStr = String(lastName || "").trim();

    if (!firstNameStr && !lastNameStr && !mobileStr) {
      alert("Please fill at least one field to update");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/dashboard/updateuserdetails",
        {
          method: "POST",
          body: JSON.stringify({
            UserId: userid,
            first_name: firstNameStr || userdata.Data?.first_name,
            last_name: lastNameStr || userdata.Data?.last_name,
            mob: mobileStr || userdata.Data?.mob,
          }),
          mode: "cors",
          headers: {
            "Content-type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const json = await response.json();
      console.log("Profile updated:", json);

      if (json.success) {
        setDetailsUpdateSuccess(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setDetailsUpdateSuccess(false);
        }, 3000);
      } else {
        alert("Failed to update profile: " + (json.message || "Unknown error"));
      }

    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile. Error: " + err.message);
    }
  };

  // Go to dashboard
  const goToDashboard = () => {
    navigate("/dashboard", { state: { id: userid } });
  };

  //-------------------------------------image-----------------------------------------//

  useEffect(() => {
    const fetchuserdata = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/dashboard/userdetails",
          {
            method: "POST",
            body: JSON.stringify({ UserId: userid }),
            mode: "cors",
            headers: {
              "Content-type": "application/json",
            },
          }
        );
        const json = await response.json();
        setuserdata(json);

        // Pre-fill form with current data
        if (json.Data) {
          setFirstName(json.Data.first_name || "");
          setLastName(json.Data.last_name || "");
          setMobile(json.Data.mob || "");
        }

        // Set current profile image
        if (json.userProfile && json.userProfile[0]) {
          setCurrentImageUrl(json.userProfile[0].url);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchuserdata();
  }, [userid]);

  // Handle back button
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-[#171b26] min-h-screen pt-[100px] pb-10">
      <div className="w-[90%] max-w-2xl mx-auto">
        {/* Header with Back and Dashboard buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 bg-[#272e41] hover:bg-[#3d4657] text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <span>←</span> Back
          </button>
          <button
            onClick={goToDashboard}
            className="flex items-center gap-2 bg-[#209fe4] hover:bg-[#1a8fd4] text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="text-white text-2xl font-bold text-center mb-6">
          Update Profile
        </div>

        {/* Profile Picture Upload */}
        <div className="bg-[#272e41] rounded-lg p-6 mb-6">
          <div className="text-white font-bold text-lg mb-4">📷 Profile Picture</div>

          {/* Current Profile Image */}
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#209fe4] bg-[#171b26]">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">
                👤
              </div>
            )}
          </div>

          {/* Image Upload Success Message */}
          {uploadSuccess && (
            <div className="bg-[#26a69a20] border border-[#26a69a] rounded-lg p-3 mb-4 text-center">
              <div className="text-[#26a69a] font-bold">✓ Image Uploaded Successfully!</div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#209fe4] file:text-white hover:file:bg-[#1a8fd4]"
            />

            {image && (
              <div className="text-gray-400 text-sm">
                Selected: {image.name}
              </div>
            )}

            <button
              onClick={uploadImage}
              disabled={!image || uploading}
              className={`py-2 px-6 rounded-lg font-semibold transition-all ${image && !uploading
                ? "bg-[#209fe4] hover:bg-[#1a8fd4] text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>

        {/* User Details Update */}
        <div className="bg-[#272e41] rounded-lg p-6">
          <div className="text-white font-bold text-lg mb-4">✏️ Edit Profile Details</div>

          {/* Details Update Success Message */}
          {detailsUpdateSuccess && (
            <div className="bg-[#26a69a20] border border-[#26a69a] rounded-lg p-3 mb-4 text-center">
              <div className="text-[#26a69a] font-bold">✓ Profile Updated Successfully!</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full bg-[#171b26] text-white p-3 rounded-lg border border-[#3d4657] focus:border-[#209fe4] outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full bg-[#171b26] text-white p-3 rounded-lg border border-[#3d4657] focus:border-[#209fe4] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full bg-[#171b26] text-white p-3 rounded-lg border border-[#3d4657] focus:border-[#209fe4] outline-none"
              />
            </div>

            <div className="text-gray-500 text-sm">
              Email: {userdata.Data?.email} (cannot be changed)
            </div>

            <button
              onClick={updateUserDetails}
              className="w-full bg-[#26a69a] hover:bg-[#1e8a7f] text-white font-bold py-3 rounded-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
