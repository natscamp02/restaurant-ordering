module.exports = {
	content: ['./views/**/*.ejs'],
	theme: {
		extend: {},

		container: {
			center: true,
			padding: '3rem',
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
