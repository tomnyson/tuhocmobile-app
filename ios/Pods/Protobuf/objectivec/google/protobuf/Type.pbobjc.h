// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: google/protobuf/type.proto

// This CPP symbol can be defined to use imports that match up to the framework
// imports needed when using CocoaPods.
#if !defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS)
 #define GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS 0
#endif

#if GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
 #import <Protobuf/GPBDescriptor.h>
 #import <Protobuf/GPBMessage.h>
 #import <Protobuf/GPBRootObject.h>
#else
 #import "GPBDescriptor.h"
 #import "GPBMessage.h"
 #import "GPBRootObject.h"
#endif

#if GOOGLE_PROTOBUF_OBJC_VERSION < 30002
#error This file was generated by a newer version of protoc which is incompatible with your Protocol Buffer library sources.
#endif
#if 30002 < GOOGLE_PROTOBUF_OBJC_MIN_SUPPORTED_VERSION
#error This file was generated by an older version of protoc which is incompatible with your Protocol Buffer library sources.
#endif

// @@protoc_insertion_point(imports)

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

CF_EXTERN_C_BEGIN

@class GPBAny;
@class GPBEnumValue;
@class GPBField;
@class GPBOption;
@class GPBSourceContext;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - Enum GPBSyntax

/** The syntax in which a protocol buffer element is defined. */
typedef GPB_ENUM(GPBSyntax) {
  /**
   * Value used if any message's field encounters a value that is not defined
   * by this enum. The message will also have C functions to get/set the rawValue
   * of the field.
   **/
  GPBSyntax_GPBUnrecognizedEnumeratorValue = kGPBUnrecognizedEnumeratorValue,
  /** Syntax `proto2`. */
  GPBSyntax_SyntaxProto2 = 0,

  /** Syntax `proto3`. */
  GPBSyntax_SyntaxProto3 = 1,
};

GPBEnumDescriptor *GPBSyntax_EnumDescriptor(void);

/**
 * Checks to see if the given value is defined by the enum or was not known at
 * the time this source was generated.
 **/
BOOL GPBSyntax_IsValidValue(int32_t value);

#pragma mark - Enum GPBField_Kind

/** Basic field types. */
typedef GPB_ENUM(GPBField_Kind) {
  /**
   * Value used if any message's field encounters a value that is not defined
   * by this enum. The message will also have C functions to get/set the rawValue
   * of the field.
   **/
  GPBField_Kind_GPBUnrecognizedEnumeratorValue = kGPBUnrecognizedEnumeratorValue,
  /** Field type unknown. */
  GPBField_Kind_TypeUnknown = 0,

  /** Field type double. */
  GPBField_Kind_TypeDouble = 1,

  /** Field type float. */
  GPBField_Kind_TypeFloat = 2,

  /** Field type int64. */
  GPBField_Kind_TypeInt64 = 3,

  /** Field type uint64. */
  GPBField_Kind_TypeUint64 = 4,

  /** Field type int32. */
  GPBField_Kind_TypeInt32 = 5,

  /** Field type fixed64. */
  GPBField_Kind_TypeFixed64 = 6,

  /** Field type fixed32. */
  GPBField_Kind_TypeFixed32 = 7,

  /** Field type bool. */
  GPBField_Kind_TypeBool = 8,

  /** Field type string. */
  GPBField_Kind_TypeString = 9,

  /** Field type group. Proto2 syntax only, and deprecated. */
  GPBField_Kind_TypeGroup = 10,

  /** Field type message. */
  GPBField_Kind_TypeMessage = 11,

  /** Field type bytes. */
  GPBField_Kind_TypeBytes = 12,

  /** Field type uint32. */
  GPBField_Kind_TypeUint32 = 13,

  /** Field type enum. */
  GPBField_Kind_TypeEnum = 14,

  /** Field type sfixed32. */
  GPBField_Kind_TypeSfixed32 = 15,

  /** Field type sfixed64. */
  GPBField_Kind_TypeSfixed64 = 16,

  /** Field type sint32. */
  GPBField_Kind_TypeSint32 = 17,

  /** Field type sint64. */
  GPBField_Kind_TypeSint64 = 18,
};

GPBEnumDescriptor *GPBField_Kind_EnumDescriptor(void);

/**
 * Checks to see if the given value is defined by the enum or was not known at
 * the time this source was generated.
 **/
BOOL GPBField_Kind_IsValidValue(int32_t value);

#pragma mark - Enum GPBField_Cardinality

/** Whether a field is optional, required, or repeated. */
typedef GPB_ENUM(GPBField_Cardinality) {
  /**
   * Value used if any message's field encounters a value that is not defined
   * by this enum. The message will also have C functions to get/set the rawValue
   * of the field.
   **/
  GPBField_Cardinality_GPBUnrecognizedEnumeratorValue = kGPBUnrecognizedEnumeratorValue,
  /** For fields with unknown cardinality. */
  GPBField_Cardinality_CardinalityUnknown = 0,

  /** For optional fields. */
  GPBField_Cardinality_CardinalityOptional = 1,

  /** For required fields. Proto2 syntax only. */
  GPBField_Cardinality_CardinalityRequired = 2,

  /** For repeated fields. */
  GPBField_Cardinality_CardinalityRepeated = 3,
};

GPBEnumDescriptor *GPBField_Cardinality_EnumDescriptor(void);

/**
 * Checks to see if the given value is defined by the enum or was not known at
 * the time this source was generated.
 **/
BOOL GPBField_Cardinality_IsValidValue(int32_t value);

#pragma mark - GPBTypeRoot

/**
 * Exposes the extension registry for this file.
 *
 * The base class provides:
 * @code
 *   + (GPBExtensionRegistry *)extensionRegistry;
 * @endcode
 * which is a @c GPBExtensionRegistry that includes all the extensions defined by
 * this file and all files that it depends on.
 **/
@interface GPBTypeRoot : GPBRootObject
@end

#pragma mark - GPBType

typedef GPB_ENUM(GPBType_FieldNumber) {
  GPBType_FieldNumber_Name = 1,
  GPBType_FieldNumber_FieldsArray = 2,
  GPBType_FieldNumber_OneofsArray = 3,
  GPBType_FieldNumber_OptionsArray = 4,
  GPBType_FieldNumber_SourceContext = 5,
  GPBType_FieldNumber_Syntax = 6,
};

/**
 * A protocol buffer message type.
 **/
@interface GPBType : GPBMessage

/** The fully qualified message name. */
@property(nonatomic, readwrite, copy, null_resettable) NSString *name;

/** The list of fields. */
@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GPBField*> *fieldsArray;
/** The number of items in @c fieldsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger fieldsArray_Count;

/** The list of types appearing in `oneof` definitions in this type. */
@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<NSString*> *oneofsArray;
/** The number of items in @c oneofsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger oneofsArray_Count;

/** The protocol buffer options. */
@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GPBOption*> *optionsArray;
/** The number of items in @c optionsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger optionsArray_Count;

/** The source context. */
@property(nonatomic, readwrite, strong, null_resettable) GPBSourceContext *sourceContext;
/** Test to see if @c sourceContext has been set. */
@property(nonatomic, readwrite) BOOL hasSourceContext;

/** The source syntax. */
@property(nonatomic, readwrite) GPBSyntax syntax;

@end

/**
 * Fetches the raw value of a @c GPBType's @c syntax property, even
 * if the value was not defined by the enum at the time the code was generated.
 **/
int32_t GPBType_Syntax_RawValue(GPBType *message);
/**
 * Sets the raw value of an @c GPBType's @c syntax property, allowing
 * it to be set to a value that was not defined by the enum at the time the code
 * was generated.
 **/
void SetGPBType_Syntax_RawValue(GPBType *message, int32_t value);

#pragma mark - GPBField

typedef GPB_ENUM(GPBField_FieldNumber) {
  GPBField_FieldNumber_Kind = 1,
  GPBField_FieldNumber_Cardinality = 2,
  GPBField_FieldNumber_Number = 3,
  GPBField_FieldNumber_Name = 4,
  GPBField_FieldNumber_TypeURL = 6,
  GPBField_FieldNumber_OneofIndex = 7,
  GPBField_FieldNumber_Packed = 8,
  GPBField_FieldNumber_OptionsArray = 9,
  GPBField_FieldNumber_JsonName = 10,
  GPBField_FieldNumber_DefaultValue = 11,
};

/**
 * A single field of a message type.
 **/
@interface GPBField : GPBMessage

/** The field type. */
@property(nonatomic, readwrite) GPBField_Kind kind;

/** The field cardinality. */
@property(nonatomic, readwrite) GPBField_Cardinality cardinality;

/** The field number. */
@property(nonatomic, readwrite) int32_t number;

/** The field name. */
@property(nonatomic, readwrite, copy, null_resettable) NSString *name;

/**
 * The field type URL, without the scheme, for message or enumeration
 * types. Example: `"type.googleapis.com/google.protobuf.Timestamp"`.
 **/
@property(nonatomic, readwrite, copy, null_resettable) NSString *typeURL;

/**
 * The index of the field type in `Type.oneofs`, for message or enumeration
 * types. The first type has index 1; zero means the type is not in the list.
 **/
@property(nonatomic, readwrite) int32_t oneofIndex;

/** Whether to use alternative packed wire representation. */
@property(nonatomic, readwrite) BOOL packed;

/** The protocol buffer options. */
@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GPBOption*> *optionsArray;
/** The number of items in @c optionsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger optionsArray_Count;

/** The field JSON name. */
@property(nonatomic, readwrite, copy, null_resettable) NSString *jsonName;

/** The string value of the default value of this field. Proto2 syntax only. */
@property(nonatomic, readwrite, copy, null_resettable) NSString *defaultValue;

@end

/**
 * Fetches the raw value of a @c GPBField's @c kind property, even
 * if the value was not defined by the enum at the time the code was generated.
 **/
int32_t GPBField_Kind_RawValue(GPBField *message);
/**
 * Sets the raw value of an @c GPBField's @c kind property, allowing
 * it to be set to a value that was not defined by the enum at the time the code
 * was generated.
 **/
void SetGPBField_Kind_RawValue(GPBField *message, int32_t value);

/**
 * Fetches the raw value of a @c GPBField's @c cardinality property, even
 * if the value was not defined by the enum at the time the code was generated.
 **/
int32_t GPBField_Cardinality_RawValue(GPBField *message);
/**
 * Sets the raw value of an @c GPBField's @c cardinality property, allowing
 * it to be set to a value that was not defined by the enum at the time the code
 * was generated.
 **/
void SetGPBField_Cardinality_RawValue(GPBField *message, int32_t value);

#pragma mark - GPBEnum

typedef GPB_ENUM(GPBEnum_FieldNumber) {
  GPBEnum_FieldNumber_Name = 1,
  GPBEnum_FieldNumber_EnumvalueArray = 2,
  GPBEnum_FieldNumber_OptionsArray = 3,
  GPBEnum_FieldNumber_SourceContext = 4,
  GPBEnum_FieldNumber_Syntax = 5,
};

/**
 * Enum type definition.
 **/
@interface GPBEnum : GPBMessage

/** Enum type name. */
@property(nonatomic, readwrite, copy, null_resettable) NSString *name;

/** Enum value definitions. */
@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GPBEnumValue*> *enumvalueArray;
/** The number of items in @c enumvalueArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger enumvalueArray_Count;

/** Protocol buffer options. */
@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GPBOption*> *optionsArray;
/** The number of items in @c optionsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger optionsArray_Count;

/** The source context. */
@property(nonatomic, readwrite, strong, null_resettable) GPBSourceContext *sourceContext;
/** Test to see if @c sourceContext has been set. */
@property(nonatomic, readwrite) BOOL hasSourceContext;

/** The source syntax. */
@property(nonatomic, readwrite) GPBSyntax syntax;

@end

/**
 * Fetches the raw value of a @c GPBEnum's @c syntax property, even
 * if the value was not defined by the enum at the time the code was generated.
 **/
int32_t GPBEnum_Syntax_RawValue(GPBEnum *message);
/**
 * Sets the raw value of an @c GPBEnum's @c syntax property, allowing
 * it to be set to a value that was not defined by the enum at the time the code
 * was generated.
 **/
void SetGPBEnum_Syntax_RawValue(GPBEnum *message, int32_t value);

#pragma mark - GPBEnumValue

typedef GPB_ENUM(GPBEnumValue_FieldNumber) {
  GPBEnumValue_FieldNumber_Name = 1,
  GPBEnumValue_FieldNumber_Number = 2,
  GPBEnumValue_FieldNumber_OptionsArray = 3,
};

/**
 * Enum value definition.
 **/
@interface GPBEnumValue : GPBMessage

/** Enum value name. */
@property(nonatomic, readwrite, copy, null_resettable) NSString *name;

/** Enum value number. */
@property(nonatomic, readwrite) int32_t number;

/** Protocol buffer options. */
@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GPBOption*> *optionsArray;
/** The number of items in @c optionsArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger optionsArray_Count;

@end

#pragma mark - GPBOption

typedef GPB_ENUM(GPBOption_FieldNumber) {
  GPBOption_FieldNumber_Name = 1,
  GPBOption_FieldNumber_Value = 2,
};

/**
 * A protocol buffer option, which can be attached to a message, field,
 * enumeration, etc.
 **/
@interface GPBOption : GPBMessage

/**
 * The option's name. For protobuf built-in options (options defined in
 * descriptor.proto), this is the short name. For example, `"map_entry"`.
 * For custom options, it should be the fully-qualified name. For example,
 * `"google.api.http"`.
 **/
@property(nonatomic, readwrite, copy, null_resettable) NSString *name;

/**
 * The option's value packed in an Any message. If the value is a primitive,
 * the corresponding wrapper type defined in google/protobuf/wrappers.proto
 * should be used. If the value is an enum, it should be stored as an int32
 * value using the google.protobuf.Int32Value type.
 **/
@property(nonatomic, readwrite, strong, null_resettable) GPBAny *value;
/** Test to see if @c value has been set. */
@property(nonatomic, readwrite) BOOL hasValue;

@end

NS_ASSUME_NONNULL_END

CF_EXTERN_C_END

#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)
