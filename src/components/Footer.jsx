/**
 * @file Footer.jsx
 * @description Application footer component displaying copyright and creator information.
 * 
 * @component
 * @returns {React.ReactElement} Footer with attribution text
 */

function Footer() {
  return (
    <footer
      className="w-full text-center py-5 px-4 sm:px-6"
      style={{
        borderTop: "0.5px solid var(--separator)",
        fontSize: "12px",
        color: "var(--label-quaternary)",
        letterSpacing: "-0.01em",
      }}
    >
      Co-created by Mackenzie Bright and Forge
    </footer>
  );
}

export default Footer;
