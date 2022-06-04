using System.Xml.Serialization;

namespace OpenApiReferenceEditor.DTO
{
	[XmlRoot(ElementName = "OpenApiReference")]
	public class OpenApiReferenceModel
	{
		[XmlElement(ElementName = "Include")]
		public string Include { get; set; }
		[XmlElement(ElementName = "CodeGenerator")]
		public string CodeGenerator { get; set; }
		[XmlElement(ElementName = "Namespace")]
		public string Namespace { get; set; }
		[XmlElement(ElementName = "ClassName")]
		public string ClassName { get; set; }
		[XmlElement(ElementName = "OutputPath")]
		public string OutputPath { get; set; }
		[XmlElement(ElementName = "Options")]
		public string Options { get; set; }
	}

	[XmlRoot(ElementName = "ItemGroup")]
	public class ItemGroup
	{
		[XmlElement(ElementName = "OpenApiReference")]
		public List<OpenApiReferenceModel> OpenApiReferences { get; set; }
		[XmlElement(ElementName = "PackageReference")]
		public PackageReference PackageReference { get; set; }
	}

	[XmlRoot(ElementName = "PackageReference")]
	public class PackageReference
	{
		[XmlAttribute(AttributeName = "Include")]
		public string Include { get; set; }
		[XmlAttribute(AttributeName = "Version")]
		public string Version { get; set; }
	}

	[XmlRoot(ElementName = "Project")]
	public class Project
	{
		[XmlElement(ElementName = "ItemGroup")]
		public List<ItemGroup> PropertyGroup { get; set; }
		[XmlAttribute(AttributeName = "Sdk")]
		public string Sdk { get; set; }
	}
}
