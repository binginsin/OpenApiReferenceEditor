using System.ComponentModel.DataAnnotations;

namespace OpenApiReferenceEditor.DTO
{
    public class OpenApiReference
    {
        public string Include { get; set; }
        public string CodeGenerator { get; set; }
        public string Namespace { get; set; }
        public string ClassName { get; set; }
        public List<NSwagOption> Options { get; set; }
    }

    public class NSwagOption
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Value { get; set; }
        public string? Type { get; set; }
        public List<string>? EnumValues { get; set; }
    }
}
