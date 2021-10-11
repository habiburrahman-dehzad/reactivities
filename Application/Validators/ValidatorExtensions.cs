using FluentValidation;

namespace Application.Validators
{
    public static class ValidatorExtensions
    {
        public static IRuleBuilder<T, string> Password<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            var options = ruleBuilder
                .NotEmpty()
                .MinimumLength(6).WithMessage("Password must be at least 6 characters")
                .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain a lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain a number")
                .Matches("[^A-Za-z0-9]").WithMessage("Password must contain a non-alphanumeric character");

            return options;
        }
    }
}