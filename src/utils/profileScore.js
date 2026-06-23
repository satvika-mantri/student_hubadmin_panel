export const calculateProfileScore = (user, fullData = null) => {
  if (!user) return { percentage: 0, missing: [], color: "var(--danger, #ef4444)" };

  let score = 0;
  const missing = [];

  // 1. Basic Info (25%)
  if (user.full_name && user.full_name !== "N/A") score += 5;
  else missing.push("Full Name");

  if (user.email && user.email !== "N/A") score += 5;
  else missing.push("Email");

  if (user.phone && user.phone !== "N/A") score += 5;
  else missing.push("Phone");

  if (user.age && user.age !== "N/A") score += 5;
  else missing.push("Age");

  if (user.address && user.address !== "N/A") score += 5;
  else missing.push("Address");

  // 2. Education (15%)
  if ((user.university && user.university !== "N/A") || (user.school_name && user.school_name !== "N/A")) score += 5;
  else missing.push("Institution (University/School)");

  if ((user.degree && user.degree !== "N/A") || (user.class && user.class !== "N/A")) score += 5;
  else missing.push("Degree/Class");

  if (user.graduation_year && user.graduation_year !== "N/A") score += 5;
  else missing.push("Graduation Year");

  // 3. Profile (15%)
  if (user.profile_image_url && user.profile_image_url !== "N/A") score += 5;
  else missing.push("Profile Image");

  if (user.about_me && user.about_me !== "N/A") score += 5;
  else missing.push("About Me");

  if (user.goal && user.goal !== "N/A") score += 5;
  else missing.push("Goal");

  // 4. Professional (15%)
  if (user.resume_url && user.resume_url !== "N/A") score += 5;
  else missing.push("Resume");

  if (user.linkedin_url && user.linkedin_url !== "N/A") score += 5;
  else missing.push("LinkedIn");

  if (user.github_url && user.github_url !== "N/A") score += 5;
  else missing.push("GitHub");

  // 5. Activity (30%) - 10% each
  const hasSkills = user.has_skills || (fullData?.skills?.length > 0);
  if (hasSkills) score += 10;
  else missing.push("Skills");

  const hasProjects = user.has_projects || (fullData?.projects?.length > 0);
  if (hasProjects) score += 10;
  else missing.push("Projects");

  const hasCertificates = user.has_certificates || (fullData?.certificates?.length > 0);
  if (hasCertificates) score += 10;
  else missing.push("Certificates");

  // Ensure max 100
  let percentage = Math.min(score, 100);

  // Determine color coding
  let color = "#ef4444"; // red -> low
  if (percentage >= 70) color = "#10b981"; // green -> strong
  else if (percentage >= 40) color = "#f59e0b"; // yellow -> medium

  return {
    percentage,
    missing,
    color
  };
};
