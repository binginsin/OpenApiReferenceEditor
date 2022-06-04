using Microsoft.AspNetCore.Mvc;
using OpenApiReferenceEditor.DTO;
using System.Xml;
using System.Xml.Serialization;
using System.Text.RegularExpressions;
using System.Text;
using System.IO;
using NSwag.CodeGeneration.CSharp;
using NJsonSchema.CodeGeneration.CSharp;
using NJsonSchema.CodeGeneration;
using System.Diagnostics.CodeAnalysis;

namespace OpenApiReferenceEditor.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OpenApiReferenceController : ControllerBase
    {

        private readonly ILogger<OpenApiReferenceController> _logger;

        public OpenApiReferenceController(ILogger<OpenApiReferenceController> logger)
        {
            _logger = logger;
        }

        [HttpGet("[action]")]
        public async Task<HashSet<NSwagOption>> GetAvailableNSwagOptions()
        {
            HashSet<Type> typesToGoThrough = new HashSet<Type>();
            typesToGoThrough.Add(typeof(CSharpClientGeneratorSettings));
            typesToGoThrough.Add(typeof(CSharpGeneratorBaseSettings));
            typesToGoThrough.Add(typeof(CSharpGeneratorSettings));
            typesToGoThrough.Add(typeof(CodeGeneratorSettingsBase));
            var options = new HashSet<NSwagOption>(new NSwagOptionComparer());
            foreach (var type in typesToGoThrough)
            {
                var props = type.GetProperties();
                foreach (var property in props)
                {
                    var name = property.Name;
                    var propType = property.PropertyType;
                    if (typesToGoThrough.Contains(propType))
                    {
                        continue;
                    }
                    var option = new NSwagOption { Name = name, Type = propType.Name };
                    List<string> enumValues = new();
                    if (propType.IsEnum)
                    {
                        try
                        {
                            enumValues = Enum.GetNames(propType).ToList();
                            option.EnumValues = enumValues;
                        }
                        catch(Exception ex)
                        {

                        }
                    }
                    else if(propType == typeof(bool))
                    {
                        option.EnumValues = new() { "true", "false" };
                    }
                    options.Add(option);
                }
            }

            return options;
        }

        class NSwagOptionComparer : EqualityComparer<NSwagOption>
        {
            public override bool Equals(NSwagOption? x, NSwagOption? y)
            {
                return x?.Name == y?.Name;
            }

            public override int GetHashCode([DisallowNull] NSwagOption obj)
            {
                return obj.Name.GetHashCode();
            }
        }

        [HttpGet("[action]")]
        public async Task<List<OpenApiReference>> ReadFile([FromQuery] string filePath)
        {
            XmlReaderSettings settings = new XmlReaderSettings();
            settings.IgnoreWhitespace = true;
            var openApiReferences = new List<OpenApiReference>();
            using (var fileStream = System.IO.File.OpenText(filePath))
            {
                XmlSerializer serializer = new XmlSerializer(typeof(Project));
                serializer.UnknownAttribute += Serializer_UnknownAtrribute;
                var project = (Project)serializer.Deserialize(fileStream);

                foreach (var propGroup in project.PropertyGroup)
                {
                    foreach (var openApiReference in propGroup.OpenApiReferences)
                    {
                        var reference = openApiReference;
                        var options = new List<NSwagOption>();
                        var optionsSplit = reference.Options?.Split(' ') ?? new string[0];
                        foreach (var option in optionsSplit)
                        {
                            var optionSplit = option.Split(':');
                            if (optionSplit.Length != 2)
                            {
                                _logger.LogError($"{option} is invalid");
                                continue;
                            }
                            options.Add(new NSwagOption() { Name = optionSplit[0].Trim('/'), Value = optionSplit[1].Replace(",", Environment.NewLine) });
                        }
                        openApiReferences.Add(new OpenApiReference()
                        {
                            ClassName = reference.ClassName,
                            Include = reference.Include,
                            CodeGenerator = reference.CodeGenerator,
                            Namespace = reference.Namespace,
                            Options = options
                        });
                    }
                }
            }
            return openApiReferences;
        }

        private void Serializer_UnknownAtrribute(object? sender, XmlAttributeEventArgs e)
        {
            var objectBeingDeserialized = e.ObjectBeingDeserialized as OpenApiReferenceModel;
            if(objectBeingDeserialized == null)
            {
                return;
            }
            switch(e.Attr.Name)
            {
                case nameof(OpenApiReferenceModel.Include): 
                    objectBeingDeserialized.Include = e.Attr.InnerText; 
                    break;
                case nameof(OpenApiReferenceModel.CodeGenerator):
                    objectBeingDeserialized.CodeGenerator = e.Attr.InnerText;
                    break;
                case nameof(OpenApiReferenceModel.ClassName):
                    objectBeingDeserialized.ClassName = e.Attr.InnerText;
                    break;
                case nameof(OpenApiReferenceModel.Namespace):
                    objectBeingDeserialized.Namespace = e.Attr.InnerText;
                    break;
                case nameof(OpenApiReferenceModel.OutputPath):
                    objectBeingDeserialized.OutputPath = e.Attr.InnerText;
                    break;
                case nameof(OpenApiReferenceModel.Options):
                    objectBeingDeserialized.Options = e.Attr.InnerText;
                    break;
            }
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> WriteFile([FromQuery] string filePath, [FromBody] List<OpenApiReference> openApiReferences)
        {
            var text = await System.IO.File.ReadAllTextAsync(filePath);

            var openApiReferenceRegex = new Regex("^\\s*<OpenApiReference(.|\\s)*?(\\/>|<\\/OpenApiReference>)", RegexOptions.Multiline);
            var emptyPropGroupRegex = new Regex("^\\s*<ItemGroup>\\s*<\\/ItemGroup>", RegexOptions.Multiline);
            var allOpenApiRemoved = openApiReferenceRegex.Replace(text, "");
            allOpenApiRemoved = emptyPropGroupRegex.Replace(allOpenApiRemoved, "");

            var propGroup = new ItemGroup()
            {
                OpenApiReferences = new List<OpenApiReferenceModel>(openApiReferences.Select(x => new OpenApiReferenceModel
                {
                    ClassName = x.ClassName,
                    Include = x.Include,
                    CodeGenerator = x.CodeGenerator,
                    Namespace = x.Namespace,
                    Options = string.Join(' ', x.Options.Select(x => $"/{x.Name}:{x.Value.Replace(Environment.NewLine, ",")}"))
                }))
            };

            var projectCloseRegex = new Regex("^\\s*<\\/Project>", RegexOptions.Multiline);
            var index = projectCloseRegex.Match(allOpenApiRemoved).Index;

            //Create our own namespaces for the output
            XmlSerializerNamespaces ns = new XmlSerializerNamespaces();
            //Add an empty namespace and empty value
            ns.Add("", "");
            XmlSerializer serializer = new XmlSerializer(typeof(ItemGroup));
            var textWriter = new StringWriter();
            var streamWriter = XmlWriter.Create(textWriter, new()
            {
                Encoding = Encoding.UTF8,
                Indent = true,
                OmitXmlDeclaration = true
            });
            serializer.Serialize(streamWriter, propGroup, ns);
            var propGroupText = textWriter.ToString();
            propGroupText = $"    {propGroupText.Replace(Environment.NewLine, $"{Environment.NewLine}    ")}";

            allOpenApiRemoved = allOpenApiRemoved.Insert(index, propGroupText).Replace("></Project>", $">{Environment.NewLine}</Project>");

            await System.IO.File.WriteAllTextAsync(filePath, allOpenApiRemoved);

            return Ok();
        }
    }
}