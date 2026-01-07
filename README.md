This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Forgot Password Functionality for Shush

This implementation adds password reset functionality for both regular users and Guardian users.

## Files Included

```
src/app/
├── auth/
│   ├── forgot-password/
│   │   └── page.js          # User password reset request page
│   └── reset-password/
│       └── page.js          # User password reset form (after clicking email link)
└── guardian/
    ├── forgot-password/
    │   └── page.js          # Guardian password reset request page
    └── reset-password/
        └── page.js          # Guardian password reset form (after clicking email link)
```

## How It Works

### Flow for Users

1. User clicks "Forgot your password?" on the login page
2. User enters their email address
3. Supabase sends a password reset email with a magic link
4. User clicks the link and is redirected to the reset password page
5. User enters their new password
6. Password is updated and user is redirected to login

### Flow for Guardians

Same as above, but with Guardian-themed pages (red color scheme) and redirects to Guardian login/dashboard.

## Supabase Configuration

### 1. Configure Site URL

In your Supabase dashboard, go to **Authentication → URL Configuration** and set:

- **Site URL**: `https://your-domain.com` (your production URL)

### 2. Configure Redirect URLs

Add these URLs to your **Redirect URLs** list:

```
https://your-domain.com/auth/reset-password
https://your-domain.com/guardian/reset-password
http://localhost:3000/auth/reset-password
http://localhost:3000/guardian/reset-password
```

### 3. Configure Email Templates (Optional)

In **Authentication → Email Templates**, you can customize the password reset email. The default template works fine, but you may want to brand it for Shush.

Example custom template for "Reset Password":

```html
<h2>Reset Your Password</h2>

<p>Hi there,</p>

<p>Someone requested a password reset for your Shush account. Click the button below to reset your password:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>Best,<br>The Shush Team</p>
```

## Installation

1. Copy the files to your existing project structure:

```bash
# From your project root
cp -r forgot-password-files/src/app/auth/forgot-password src/app/auth/
cp -r forgot-password-files/src/app/auth/reset-password src/app/auth/
cp -r forgot-password-files/src/app/guardian/forgot-password src/app/guardian/
cp -r forgot-password-files/src/app/guardian/reset-password src/app/guardian/
```

2. The login pages already have links to these routes, so no additional changes needed there.

## Features

- **Email validation** before submission
- **Loading states** while processing
- **Success messages** with clear next steps
- **Invalid/expired link handling** with option to request new link
- **Password confirmation** to prevent typos
- **Auto-redirect** to login after successful reset
- **Consistent styling** matching existing auth pages (indigo for users, red for Guardians)

## Security Notes

- Reset links expire after 1 hour (Supabase default)
- Users are signed out after password reset for security
- The reset page validates that a proper recovery session exists before showing the form
- Invalid or expired links show a helpful error message

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `/auth/login` or `/guardian/login`
3. Click "Forgot your password?"
4. Enter an email address registered in your Supabase project
5. Check the email inbox (or Supabase logs if email not configured)
6. Click the reset link
7. Enter a new password and confirm

### Testing in Development

If you don't have email configured in Supabase, you can:

1. Check the Supabase dashboard under **Authentication → Users** 
2. Look at the user's auth history
3. Or enable "Confirm email" to be false in development

## Troubleshooting

**"Invalid or Expired Link" showing immediately:**
- Make sure your redirect URLs are configured in Supabase
- Check that `window.location.origin` matches your site URL

**Email not arriving:**
- Check spam folder
- Verify SMTP is configured in Supabase (or you're using their default)
- Check Supabase logs for errors

**Reset fails after clicking link:**
- The token may have expired (1 hour limit)
- Try requesting a new reset link