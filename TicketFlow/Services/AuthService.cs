
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TicketFlow.Data;
using TicketFlow.Models;
using TicketFlow.Services.Interfaces;

namespace TicketFlow.Services
{
    public class AuthService : IAuthService
    {
        private readonly TicketFlowDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(
            TicketFlowDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var email = request.Email.Trim();

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == email &&
                    u.IsActive &&
                    !u.IsDeleted);

            if (user == null ||
                !BCrypt.Net.BCrypt.Verify(
                    request.Password, user.PasswordHash))
            {
                return null;
            }

            var token = GenerateJwtToken(user);

            return new LoginResponse
            {
                Token = token,
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }

        private string GenerateJwtToken(Models.User user)
        {
            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException(
                    "JWT signing key is missing.");

            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));

            var credentials = new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
