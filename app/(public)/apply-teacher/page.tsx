import React from 'react'

const page = () => {
  return (
    <div>
      <h1>Apply to be a Teacher</h1>
      <p>Please fill out the form below to apply for a teaching position.</p>
      <form>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="subject">Subject:</label>
          <input type="text" id="subject" name="subject" required />
        </div>
        <button type="submit">Submit Application</button>
      </form>
    </div>
  )
}

export default page
