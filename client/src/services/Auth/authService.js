
export const registerUser = async (formData) => {
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      body: formData, // <-- no need to stringify
      // Do NOT manually set Content-Type when sending FormData
    });
    const data = await response.json();
    return { data, status: response.status };
  } catch (err) {
    throw new Error('An error occurred while registering');
  }
};

  
  export const loginUser = async (formData) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();

      console.log({response});
      

      return { data, status: response.status };
    } catch (err) {
      throw new Error('An error occurred while logging in');
    }
  };