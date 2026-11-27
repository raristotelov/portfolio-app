import { Fragment } from "react";
import type { CSSProperties } from "react";
import { CONTACT_EMAIL_FOOTER, CONTACT_EMAIL_HEADING } from "@/constants/contact";
import { EMAIL_COLORS, EMAIL_FONT_FAMILY } from "@/constants/emailTheme";

export interface ContactNotificationEmailProps {
	name: string;
	email: string;
	message: string;
	firstName: string;
	emailHref: string;
	replyHref: string;
}

const LINE_BREAK_PATTERN = /\r?\n/;

const body: CSSProperties = {
	margin: 0,
	padding: 0,
	backgroundColor: EMAIL_COLORS.background,
	fontFamily: EMAIL_FONT_FAMILY,
};

const outerCell: CSSProperties = {
	padding: "40px 24px",
	backgroundColor: EMAIL_COLORS.background,
};

const card: CSSProperties = {
	width: "100%",
	maxWidth: 600,
	margin: "0 auto",
	borderCollapse: "separate",
	backgroundColor: EMAIL_COLORS.surface,
	border: `1px solid ${EMAIL_COLORS.borderSubtle}`,
	borderRadius: 16,
};

const cardContent: CSSProperties = {
	padding: 40,
	fontFamily: EMAIL_FONT_FAMILY,
};

const logo: CSSProperties = {
	margin: "0 0 28px",
	fontSize: 28,
	lineHeight: "44.8px",
	fontWeight: 800,
	letterSpacing: -1,
	color: EMAIL_COLORS.textPrimary,
};

const logoDot: CSSProperties = {
	color: EMAIL_COLORS.accent,
};

const heading: CSSProperties = {
	margin: "0 0 8px",
	fontSize: 24,
	lineHeight: "30px",
	fontWeight: 800,
	letterSpacing: -0.5,
	color: EMAIL_COLORS.textPrimary,
};

const intro: CSSProperties = {
	margin: "0 0 28px",
	fontSize: 15,
	lineHeight: "24px",
	fontWeight: 300,
	color: EMAIL_COLORS.textSecondary,
};

const label: CSSProperties = {
	margin: "0 0 4px",
	fontSize: 12,
	lineHeight: "19.2px",
	fontWeight: 600,
	letterSpacing: 0.8,
	textTransform: "uppercase",
	color: EMAIL_COLORS.textSecondary,
};

const value: CSSProperties = {
	margin: "0 0 16px",
	fontSize: 15,
	lineHeight: "24px",
	fontWeight: 600,
	color: EMAIL_COLORS.textPrimary,
};

const emailLink: CSSProperties = {
	color: EMAIL_COLORS.accent,
	textDecoration: "none",
};

const messageLabel: CSSProperties = {
	...label,
	margin: "28px 0 8px",
};

const messageBox: CSSProperties = {
	width: "100%",
	borderCollapse: "separate",
};

const messageBoxCell: CSSProperties = {
	padding: 20,
	backgroundColor: EMAIL_COLORS.surfaceMuted,
	borderRadius: 12,
};

const messageText: CSSProperties = {
	margin: 0,
	fontSize: 15,
	lineHeight: "24px",
	fontWeight: 400,
	color: EMAIL_COLORS.textPrimary,
	overflowWrap: "anywhere",
};

const buttonTable: CSSProperties = {
	margin: "28px 0",
	borderCollapse: "separate",
};

const buttonCell: CSSProperties = {
	backgroundColor: EMAIL_COLORS.accentFill,
	borderRadius: 12,
};

const replyButton: CSSProperties = {
	display: "inline-block",
	padding: "12px 28px",
	fontSize: 14,
	lineHeight: "22.4px",
	fontWeight: 600,
	letterSpacing: -0.2,
	color: EMAIL_COLORS.staticWhite,
	textDecoration: "none",
};

const divider: CSSProperties = {
	height: 1,
	margin: "0 0 28px",
	fontSize: 1,
	lineHeight: "1px",
	backgroundColor: EMAIL_COLORS.borderSubtle,
};

const footer: CSSProperties = {
	margin: 0,
	fontSize: 13,
	lineHeight: "20.8px",
	fontWeight: 300,
	color: EMAIL_COLORS.textSecondary,
};

export default function ContactNotificationEmail({ name, email, message, firstName, emailHref, replyHref }: ContactNotificationEmailProps) {
	const messageLines = message.split(LINE_BREAK_PATTERN);

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>{CONTACT_EMAIL_HEADING}</title>
			</head>
			<body style={body}>
				<table
					role="presentation"
					width="100%"
					cellPadding={0}
					cellSpacing={0}
					border={0}
					style={{ backgroundColor: EMAIL_COLORS.background }}
				>
					<tbody>
						<tr>
							<td align="center" style={outerCell}>
								<table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={card}>
									<tbody>
										<tr>
											<td style={cardContent}>
												<p style={logo}>
													ra<span style={logoDot}>.</span>
												</p>

												<h1 style={heading}>{CONTACT_EMAIL_HEADING}</h1>
												<p style={intro}>{name} sent you a message through the contact form.</p>

												<p style={label}>Name</p>
												<p style={value}>{name}</p>

												<p style={label}>Email</p>
												<p style={value}>
													<a href={emailHref} style={emailLink}>
														{email}
													</a>
												</p>

												<p style={messageLabel}>Message</p>
												<table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={messageBox}>
													<tbody>
														<tr>
															<td style={messageBoxCell}>
																<p style={messageText}>
																	{messageLines.map((line, index) => (
																		<Fragment key={index}>
																			{index > 0 && <br />}
																			{line}
																		</Fragment>
																	))}
																</p>
															</td>
														</tr>
													</tbody>
												</table>

												<table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={buttonTable}>
													<tbody>
														<tr>
															<td style={buttonCell}>
																<a href={replyHref} style={replyButton}>
																	Reply to {firstName}
																</a>
															</td>
														</tr>
													</tbody>
												</table>

												<div style={divider} />
												<p style={footer}>{CONTACT_EMAIL_FOOTER}</p>
											</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
				</table>
			</body>
		</html>
	);
}
