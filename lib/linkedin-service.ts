// This service handles fetching additional data from LinkedIn API

export async function fetchLinkedInData(accessToken: string) {
  try {
    // Basic profile data
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch LinkedIn profile data")
    }

    const profileData = await profileResponse.json()

    // Email address
    const emailResponse = await fetch(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    let email = null
    if (emailResponse.ok) {
      const emailData = await emailResponse.json()
      email = emailData.elements?.[0]?.["handle~"]?.emailAddress || null
    }

    // Education data
    const educationResponse = await fetch(
      "https://api.linkedin.com/v2/educations?q=members&projection=(elements*(schoolName,fieldOfStudy,degree,timePeriod))",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    let education = []
    if (educationResponse.ok) {
      const educationData = await educationResponse.json()
      education = educationData.elements || []
    }

    // Position/work experience data
    const positionsResponse = await fetch(
      "https://api.linkedin.com/v2/positions?q=members&projection=(elements*(title,company,timePeriod))",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    let positions = []
    if (positionsResponse.ok) {
      const positionsData = await positionsResponse.json()
      positions = positionsData.elements || []
    }

    // Combine all data
    return {
      id: profileData.id,
      firstName: profileData.localizedFirstName,
      lastName: profileData.localizedLastName,
      headline: profileData.headline,
      industry: profileData.industry,
      country: profileData.location?.country?.code,
      email,
      education,
      positions,
    }
  } catch (error) {
    console.error("Error fetching LinkedIn data:", error)
    // Return minimal data that we can get from the session
    return {
      firstName: "",
      lastName: "",
      email: "",
    }
  }
}
